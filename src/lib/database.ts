import { supabase } from './supabase';

export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdraw' | 'swap';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  created_at: string;
  is_admin?: boolean;
}

export interface UserBalance {
  id: string;
  user_id: string;
  crypto_symbol: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  type: TransactionType;
  crypto_symbol?: string;
  amount?: number;
  usd_amount: number;
  status: TransactionStatus;
  from_symbol?: string;
  to_symbol?: string;
  from_amount?: number;
  to_amount?: number;
  admin_notes?: string;
  tx_hash?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

// Get all users using the view
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users_with_emails')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get user balances
export async function getUserBalances(userId: string) {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as UserBalance[];
}

// Get all user balances for admin
export async function getAllUserBalances() {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*');
  
  if (error) throw error;
  return data as UserBalance[];
}

// Update user balance - SETS the balance directly (not add)
export async function updateUserBalance(
  userId: string, 
  cryptoSymbol: string, 
  newBalance: number, 
  adminId: string,
  reason?: string
) {
  // First check if a record exists
  const { data: existing } = await supabase
    .from('user_balances')
    .select('id')
    .eq('user_id', userId)
    .eq('crypto_symbol', cryptoSymbol)
    .single();
  
  let result;
  
  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('user_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('crypto_symbol', cryptoSymbol)
      .select();
    
    if (error) throw error;
    result = data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('user_balances')
      .insert({
        user_id: userId,
        crypto_symbol: cryptoSymbol,
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    result = data;
  }
  
  // Log admin action
  await supabase
    .from('admin_logs')
    .insert({
      admin_id: adminId,
      action: 'set_balance',
      details: {
        user_id: userId,
        crypto_symbol: cryptoSymbol,
        new_balance: newBalance,
        reason: reason || 'Manual balance adjustment'
      }
    });
  
  return result;
}
// Get all transactions with user info
export async function getAllTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Get user info for each transaction
  const transactionsWithUsers = await Promise.all(
    (data || []).map(async (tx) => {
      const { data: profile } = await supabase
        .from('users_with_emails')
        .select('full_name, email')
        .eq('user_id', tx.user_id)
        .single();
      
      return {
        ...tx,
        userEmail: profile?.email || 'Unknown',
        userName: profile?.full_name || 'Unknown'
      };
    })
  );
  
  return transactionsWithUsers;
}

// Update transaction status
export async function updateTransactionStatus(
  transactionId: number, 
  status: 'approved' | 'rejected', 
  adminId: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      status,
      approved_at: new Date().toISOString(),
      approved_by: adminId,
      admin_notes: notes
    })
    .eq('id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  
  // If approved and it's a deposit, update user balance
  if (status === 'approved' && data.type === 'deposit' && data.crypto_symbol && data.amount) {
    // Get current balance
    const { data: currentBalance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', data.user_id)
      .eq('crypto_symbol', data.crypto_symbol)
      .single();
    
    const newBalance = (currentBalance?.balance || 0) + data.amount;
    
    await updateUserBalance(
      data.user_id,
      data.crypto_symbol,
      newBalance,
      adminId,
      `Deposit approved - Transaction #${transactionId}`
    );
  }
  
  // Log admin action
  await supabase
    .from('admin_logs')
    .insert({
      admin_id: adminId,
      action: `transaction_${status}`,
      details: {
        transaction_id: transactionId,
        notes
      }
    });
  
  return data;
}

// Get current admin info
export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}