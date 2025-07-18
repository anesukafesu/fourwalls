import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

function SignInRequired() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#fffee9" }}
    >
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign in to start chatting
            </h3>
            <p className="text-gray-600">
              You need to be signed in to use the chat feature.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInRequired;
