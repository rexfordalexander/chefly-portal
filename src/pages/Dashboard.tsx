
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  customer: {
    first_name: string;
    last_name: string;
  };
  booking_date: string;
  start_time: string;
  duration_hours: number;
  number_of_guests: number;
  total_amount: number;
  special_requests: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface Stats {
  totalOrders: number;
  totalHours: number;
  totalEarnings: number;
  rating: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [isChef, setIsChef] = useState(false);
  const [user, setUser] = useState(null);

  // Get current user and check if they're a chef
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("chef_profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setIsChef(!!data);
          });
      }
    });
  }, []);

  // Fetch chef stats
  const { data: stats } = useQuery<Stats>({
    queryKey: ["chef-stats", user?.id],
    enabled: !!user && isChef,
    queryFn: async () => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("duration_hours, total_amount, status")
        .eq("chef_id", user.id);

      if (error) throw error;

      const completedBookings = bookings?.filter(b => b.status === "completed") || [];
      
      const { data: chefProfile } = await supabase
        .from("chef_profiles")
        .select("rating")
        .eq("id", user.id)
        .single();

      return {
        totalOrders: completedBookings.length,
        totalHours: completedBookings.reduce((acc, b) => acc + b.duration_hours, 0),
        totalEarnings: completedBookings.reduce((acc, b) => acc + b.total_amount, 0),
        rating: chefProfile?.rating || 0
      };
    }
  });

  // Fetch orders
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["chef-orders", user?.id],
    enabled: !!user && isChef,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customer:customer_id (
            first_name,
            last_name
          )
        `)
        .eq("chef_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Listen for new bookings
  useEffect(() => {
    if (!user?.id || !isChef) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `chef_id=eq.${user.id}`
        },
        () => {
          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ["chef-orders"] });
          queryClient.invalidateQueries({ queryKey: ["chef-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isChef]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order accepted",
        description: "You've successfully accepted the booking.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept the booking.",
      });
    }
  };

  if (!isChef) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Customer Dashboard</h1>
          <p className="text-muted-foreground">View your bookings and manage your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Chef Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, orders, and availability
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Worked</p>
                <h3 className="text-2xl font-bold">{stats?.totalHours || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <h3 className="text-2xl font-bold">${stats?.totalEarnings || 0}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <h3 className="text-2xl font-bold">{stats?.rating || 0}</h3>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {orders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">
                        Booking for {order.number_of_guests} guests
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.first_name} {order.customer.last_name} •{" "}
                        {new Date(order.booking_date).toLocaleDateString()} at{" "}
                        {order.start_time}
                      </p>
                      {order.special_requests && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Special requests: {order.special_requests}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-1">
                        ${order.total_amount} • {order.duration_hours} hours
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="text-center text-muted-foreground">No orders yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              {/* Add profile settings form here */}
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              {/* Add payment methods here */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
