
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  fields: { name: string; label: string; type: string }[];
  supportedCountries: string[];
}

interface PaymentInfo {
  available_balance?: number;
  country?: string;
  saved_methods?: any[];
  withdrawals?: any[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: "🏦",
    fields: [
      { name: "accountNumber", label: "Account Number", type: "text" },
      { name: "routingNumber", label: "Routing Number", type: "text" },
      { name: "accountName", label: "Account Holder Name", type: "text" },
    ],
    supportedCountries: ["US", "CA", "UK", "AU", "EU"],
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "💸",
    fields: [
      { name: "email", label: "PayPal Email", type: "email" },
    ],
    supportedCountries: ["US", "CA", "UK", "AU", "EU", "MX", "BR", "IN"],
  },
  {
    id: "venmo",
    name: "Venmo",
    icon: "📱",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel" },
      { name: "username", label: "Venmo Username", type: "text" },
    ],
    supportedCountries: ["US"],
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: "📲",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel" },
    ],
    supportedCountries: ["KE", "TZ", "GH"],
  },
  {
    id: "upi",
    name: "UPI",
    icon: "🇮🇳",
    fields: [
      { name: "upiId", label: "UPI ID", type: "text" },
    ],
    supportedCountries: ["IN"],
  },
  {
    id: "alipay",
    name: "Alipay",
    icon: "🇨🇳",
    fields: [
      { name: "email", label: "Alipay Account Email", type: "email" },
    ],
    supportedCountries: ["CN", "HK", "SG"],
  },
  {
    id: "wechat_pay",
    name: "WeChat Pay",
    icon: "💬",
    fields: [
      { name: "phoneNumber", label: "Phone Number", type: "tel" },
    ],
    supportedCountries: ["CN", "HK", "SG"],
  },
];

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "EU", name: "European Union" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "SG", name: "Singapore" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzania" },
  { code: "GH", name: "Ghana" },
];

export const PaymentWithdrawal = () => {
  const [country, setCountry] = useState<string>("");
  const [availableAmount, setAvailableAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    // Reset form when method changes
    setFormData({});
  }, [selectedMethod]);

  useEffect(() => {
    // Fetch chef's available balance and saved payment methods
    const fetchPaymentInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: chefData } = await supabase
          .from("chef_profiles")
          .select("payment_info")
          .eq("id", user.id)
          .single();
        
        if (chefData?.payment_info) {
          const paymentInfo = chefData.payment_info as PaymentInfo;
          setAvailableAmount(paymentInfo.available_balance || 0);
          setSavedMethods(paymentInfo.saved_methods || []);
          setWithdrawals(paymentInfo.withdrawals || []);
          
          // Set country if already saved
          if (paymentInfo.country) {
            setCountry(paymentInfo.country);
          }
        }
      }
    };

    fetchPaymentInfo();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const savePaymentMethod = async () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return;
    
    // Validate form fields
    const missingFields = method.fields.filter(field => !formData[field.name]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in all required fields`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please sign in to save payment methods",
          variant: "destructive",
        });
        return;
      }

      // Create a new method object with all form data
      const newMethod = {
        id: `${selectedMethod}_${Date.now()}`,
        type: selectedMethod,
        details: formData,
        createdAt: new Date().toISOString(),
      };

      // Update chef_profiles with the new payment method
      const { error } = await supabase
        .from("chef_profiles")
        .update({
          payment_info: {
            available_balance: availableAmount,
            country,
            saved_methods: [...savedMethods, newMethod],
            withdrawals: withdrawals || [],
          }
        })
        .eq("id", user.id);

      if (error) throw error;

      setSavedMethods([...savedMethods, newMethod]);
      setFormData({});
      setSelectedMethod("");
      
      toast({
        title: "Payment method saved",
        description: "Your payment information has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    }
  };

  const requestWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(withdrawalAmount) > availableAmount) {
      toast({
        title: "Insufficient funds",
        description: "You cannot withdraw more than your available balance",
        variant: "destructive",
      });
      return;
    }

    if (savedMethods.length === 0) {
      toast({
        title: "No payment method",
        description: "Please add a payment method before requesting a withdrawal",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real application, you would call an API to process the withdrawal
      // Here we're just updating the available balance
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please sign in to request a withdrawal",
          variant: "destructive",
        });
        return;
      }

      const newBalance = availableAmount - parseFloat(withdrawalAmount);
      const newWithdrawal = {
        amount: parseFloat(withdrawalAmount),
        method: savedMethods[0].type,
        status: "processing",
        requestedAt: new Date().toISOString(),
      };
      
      const updatedWithdrawals = withdrawals ? [...withdrawals, newWithdrawal] : [newWithdrawal];
      
      const { error } = await supabase
        .from("chef_profiles")
        .update({
          payment_info: {
            available_balance: newBalance,
            country,
            saved_methods: savedMethods,
            withdrawals: updatedWithdrawals
          }
        })
        .eq("id", user.id);

      if (error) throw error;

      setAvailableAmount(newBalance);
      setWithdrawalAmount("");
      setWithdrawals(updatedWithdrawals);
      
      toast({
        title: "Withdrawal requested",
        description: `Your withdrawal of $${withdrawalAmount} is being processed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive",
      });
    }
  };

  const availablePaymentMethods = country
    ? paymentMethods.filter(method => 
        method.supportedCountries.includes(country)
      )
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
          <CardDescription>
            Your current earnings available for withdrawal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${availableAmount.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Settings</CardTitle>
          <CardDescription>
            Set up your payment methods and request withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {country && (
            <>
              <div className="space-y-2">
                <Label>Saved Payment Methods</Label>
                {savedMethods.length > 0 ? (
                  <div className="space-y-2">
                    {savedMethods.map(method => {
                      const methodInfo = paymentMethods.find(m => m.id === method.type);
                      return (
                        <div key={method.id} className="p-3 border rounded-md flex items-center">
                          <div className="mr-2 text-xl">{methodInfo?.icon}</div>
                          <div>
                            <div className="font-medium">{methodInfo?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(method.details)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No payment methods saved yet
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Add New Payment Method</Label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{method.icon}</span>
                          <span>{method.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMethod && (
                <div className="space-y-3 border p-3 rounded-md">
                  {paymentMethods
                    .find(m => m.id === selectedMethod)
                    ?.fields.map(field => (
                      <div key={field.name} className="space-y-1">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Input
                          id={field.name}
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={e => handleInputChange(field.name, e.target.value)}
                        />
                      </div>
                    ))}
                  <Button onClick={savePaymentMethod} className="w-full">
                    Save Payment Method
                  </Button>
                </div>
              )}

              {savedMethods.length > 0 && (
                <div className="space-y-3 mt-6">
                  <Label htmlFor="withdraw-amount">Request Withdrawal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Amount to withdraw"
                      value={withdrawalAmount}
                      onChange={e => setWithdrawalAmount(e.target.value)}
                    />
                    <Button onClick={requestWithdrawal}>
                      Withdraw
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
