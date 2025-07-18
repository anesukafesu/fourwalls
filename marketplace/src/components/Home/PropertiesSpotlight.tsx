import PropertyCard from "@/components/Home/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationAction {
  label: string;
  navigateTo: string;
}

interface PropertiesSpotlightProps {
  properties: any[];
  isLoading: boolean;
  title: string;
  subtitle: string;
  primaryAction?: NavigationAction;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  emptyStateAction?: NavigationAction;
}

export default function PropertiesSpotlight(props: PropertiesSpotlightProps) {
  const navigate = useNavigate();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {props.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {props.subtitle}
          </p>
        </div>

        {props.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
              >
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="bg-gray-200 h-6 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : props.properties && props.properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {props.properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            <div className="text-center">
              {props.primaryAction && (
                <Button
                  onClick={() => navigate(props.primaryAction.navigateTo)}
                  size="lg"
                  className="bg-primary hover:bg-primary-600"
                >
                  {props.primaryAction.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {props.emptyStateTitle}
            </h3>
            <p className="text-gray-600 mb-6">{props.emptyStateSubtitle}</p>
            {props.emptyStateAction && (
              <Button
                onClick={() => navigate(props.emptyStateAction.navigateTo)}
              >
                List Your Property
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
