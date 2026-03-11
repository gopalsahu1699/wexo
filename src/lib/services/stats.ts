import { createClient } from "@/lib/supabase";

export async function getDashboardStats() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { jobs: 0, workers: 0, revenue: 0, growth: 0 };

    // 1. Total Jobs
    const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // 2. Total Workers
    const { count: workersCount } = await supabase
        .from('staff_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

    // 3. Today's Revenue (from finalized invoices)
    const today = new Date().toISOString().split('T')[0];
    const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('invoice_date', today);

    const dailyRevenue = invoices?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;

    return {
        jobs: jobsCount || 0,
        workers: workersCount || 0,
        revenue: dailyRevenue,
        growth: 0
    };
}

export async function getFinanceStats(startDate?: string, endDate?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { 
        totalRevenue: 0, 
        totalPayroll: 0, 
        pendingPayments: 0, 
        totalExpenses: 0, 
        netProfit: 0, 
        growth: 0,
        paymentIn: 0,
        paymentOut: 0
    };

    // 1. Total Revenue (Invoiced Amount)
    let revenueQuery = supabase
        .from('invoices')
        .select('total_amount, status, invoice_date')
        .eq('user_id', user.id);

    if (startDate) revenueQuery = revenueQuery.gte('invoice_date', startDate);
    if (endDate) revenueQuery = revenueQuery.lte('invoice_date', endDate);

    const { data: invoices } = await revenueQuery;

    const totalRevenue = invoices?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;
    const pendingPayments = invoices?.filter(inv => inv.status !== 'paid').reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;

    // 2. Total Payments In/Out
    let paymentsQuery = supabase
        .from('payments')
        .select('amount, type, payment_date')
        .eq('user_id', user.id);

    if (startDate) paymentsQuery = paymentsQuery.gte('payment_date', startDate);
    if (endDate) paymentsQuery = paymentsQuery.lte('payment_date', endDate);

    const { data: payments } = await paymentsQuery;

    const paymentIn = payments?.filter(p => p.type === 'payment_in').reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
    const paymentOut = payments?.filter(p => p.type === 'payment_out').reduce((acc, p) => acc + (p.amount || 0), 0) || 0;

    // 3. Total Payroll (Current active staff salaries)
    // Note: Staff salary is a standard monthly liability, but we can filter attendance-based wages in the future
    const { data: staff } = await supabase
        .from('staff_members')
        .select('salary')
        .eq('user_id', user.id);

    const totalPayroll = staff?.reduce((acc, s) => acc + (s.salary || 0), 0) || 0;

    // 4. Monthly Expenses & Purchases
    let expensesQuery = supabase
        .from('expenses')
        .select('amount, created_at')
        .eq('user_id', user.id);
    
    // Expenses usually have created_at as timestamp
    if (startDate) expensesQuery = expensesQuery.gte('created_at', startDate);
    if (endDate) expensesQuery = expensesQuery.lte('created_at', endDate);

    let purchasesQuery = supabase
        .from('purchases')
        .select('total_amount, purchase_date')
        .eq('user_id', user.id);

    if (startDate) purchasesQuery = purchasesQuery.gte('purchase_date', startDate);
    if (endDate) purchasesQuery = purchasesQuery.lte('purchase_date', endDate);

    const { data: expensesData } = await expensesQuery;
    const { data: purchasesData } = await purchasesQuery;

    const pureExpenses = expensesData?.reduce((acc, exp) => acc + (exp.amount || 0), 0) || 0;
    const totalPurchases = purchasesData?.reduce((acc, pur) => acc + (pur.total_amount || 0), 0) || 0;

    // Actual Profit Loss Calculation
    const actualIncome = totalRevenue + paymentIn;
    const actualExpenses = totalPurchases + totalPayroll + pureExpenses + paymentOut;
    const netProfit = actualIncome - actualExpenses;

    const growth = actualIncome > 0 ? ((netProfit / actualIncome) * 100).toFixed(1) : 0;

    return {
        totalRevenue,
        totalPayroll,
        pendingPayments,
        totalExpenses: actualExpenses,
        netProfit,
        growth: Number(growth),
        paymentIn,
        paymentOut
    };
}
