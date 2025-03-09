
import { ChefHat, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-display">
                    Your Personal Chef
                    <br />
                    One Click Away
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Connect with professional chefs or showcase your culinary
                    skills with delizofare. Experience personalized dining like never before.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/explore">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      <Utensils className="mr-2 h-4 w-4" />
                      Find a Chef
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full min-[400px]:w-auto"
                    >
                      <ChefHat className="mr-2 h-4 w-4" />
                      Become a Chef
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 lg:flex lg:items-center">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80"
                    alt="Chef cooking"
                    className="aspect-[4/5] object-cover rounded-xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80"
                    alt="Plated dish"
                    className="aspect-[4/5] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
