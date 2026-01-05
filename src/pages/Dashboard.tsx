import { MainLayout } from '@/components/layout/MainLayout';
import { useEarnings } from '@/hooks/useEarnings';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { isCreator } = useAuth();
  const { stats, transactions, loading } = useEarnings();

  if (!isCreator) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-display font-bold mb-4">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            You need to be a creator to access the dashboard
          </p>
        </div>
      </MainLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'This Month',
      value: `$${stats.monthlyEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Subscribers',
      value: stats.subscriberCount.toString(),
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Tips Received',
      value: `$${stats.tipEarnings.toFixed(2)}`,
      icon: CreditCard,
      color: 'text-pink-500',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </>
          ) : (
            statCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 gradient-primary opacity-50" />
              </Card>
            ))
          )}
        </div>

        {/* Earnings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <span className="text-muted-foreground">Subscriptions</span>
                <span className="font-semibold">${stats.subscriptionEarnings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <span className="text-muted-foreground">Tips</span>
                <span className="font-semibold">${stats.tipEarnings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <span className="text-muted-foreground">Pay-Per-View</span>
                <span className="font-semibold">${stats.ppvEarnings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map(tx => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-500">+${tx.net_amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Fee: ${tx.platform_fee}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}