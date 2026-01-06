import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, Home, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AccessDeniedProps {
  requiredRole?: "creator" | "admin";
}

export default function AccessDenied({ requiredRole }: AccessDeniedProps) {
  const { isCreator } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display">Access Denied</CardTitle>
          <CardDescription className="text-base">
            {requiredRole === "creator" && !isCreator
              ? "You need to be a creator to access this page."
              : requiredRole === "admin"
              ? "This page is restricted to administrators only."
              : "You don't have permission to view this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredRole === "creator" && !isCreator && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-muted-foreground mb-3">
                Want to create content and earn money?
              </p>
              <Button asChild className="gradient-primary w-full">
                <Link to="/settings">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Become a Creator
                </Link>
              </Button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button asChild>
              <Link to="/feed">
                <Home className="h-4 w-4 mr-2" />
                Go to Feed
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
