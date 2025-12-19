import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card text-center border-white/5">
        <CardContent className="pt-6 pb-8 space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
