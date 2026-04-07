import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="flex flex-col items-center text-center p-6">
          
          {/* Icon */}
          <ShieldX className="w-12 h-12 text-destructive mb-4" />

          {/* Title */}
          <h1 className="text-2xl font-semibold">Access Denied</h1>

          {/* Description */}
          <p className="text-muted-foreground mt-2">
            You don’t have permission to access this page. Please contact your administrator.
          </p>

          {/* Action Button */}
          <Link href="/" className="mt-6 w-full">
            <Button className="w-full">
              Return to Home
            </Button>
          </Link>

        </CardContent>
      </Card>
    </div>
  );
}