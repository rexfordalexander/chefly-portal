
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, DollarSign, Users } from "lucide-react";

const Dashboard = () => {
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
                <h3 className="text-2xl font-bold">128</h3>
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
                <h3 className="text-2xl font-bold">256</h3>
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
                <h3 className="text-2xl font-bold">$12,800</h3>
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
                <h3 className="text-2xl font-bold">4.9</h3>
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
                {/* Sample order */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Private Dinner Party</p>
                    <p className="text-sm text-muted-foreground">
                      4 guests • March 15, 2024
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
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
