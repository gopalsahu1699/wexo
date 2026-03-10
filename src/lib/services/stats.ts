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

export async function getFinanceStats() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalRevenue: 0, totalPayroll: 0, pendingPayments: 0, totalExpenses: 0, netProfit: 0, growth: 0 };

    // 1. Total Revenue
    const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('user_id', user.id);

    const totalRevenue = invoices?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;
    const pendingPayments = invoices?.filter(inv => inv.status !== 'paid').reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;

    // 2. Total Payroll
    const { data: staff } = await supabase
        .from('staff_members')
        .select('salary')
        .eq('user_id', user.id);

    const totalPayroll = staff?.reduce((acc, s) => acc + (s.salary || 0), 0) || 0;

    // 3. Total Expenses
    const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id);

    const { data: purchasesData } = await supabase
        .from('purchases')
        .select('total_amount')
        .eq('user_id', user.id);

    const pureExpenses = expensesData?.reduce((acc, exp) => acc + (exp.amount || 0), 0) || 0;
    const purchases = purchasesData?.reduce((acc, pur) => acc + (pur.total_amount || 0), 0) || 0;

    const totalExpenses = pureExpenses + purchases + totalPayroll;

    // 4. Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 5. Monthly Growth (Simplified logic: we'll simulate it based on profit for now, but in a real app would group by month)
    const growth = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return {
        totalRevenue,
        totalPayroll,
        pendingPayments,
        totalExpenses,
        netProfit,
        growth: Number(growth)
    };
}
