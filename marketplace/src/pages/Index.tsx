
import Hero from "@/components/Home/Hero";
import NeighbourhoodSnapshot from "@/components/Home/NeighbourhoodSnapshot";
import BlogSnippet from "@/components/Home/BlogSnippet";
import { ChatProvider } from "@/contexts/ChatContext";
import FeaturedProperties from "@/components/Home/FeaturedProperties";

const Index = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FeaturedProperties />
        </div>
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NeighbourhoodSnapshot />
          </div>
        </div>
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogSnippet />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;
