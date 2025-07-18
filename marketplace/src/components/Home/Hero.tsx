import UnifiedSearchForm from "@/components/Search/UnifiedSearchForm";

const Hero = () => {
  return (
    <div className="relative bg-primary text-white">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            Kigali's most <span className="text-secondary">delightful</span>{" "}
            <br />
            <span className="text-accent">housing marketplace.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90 font-medium">
            Discover your perfect home with intelligent recommendations and
            comprehensive property insights.
          </p>
        </div>

        {/* Search Form */}
        <UnifiedSearchForm variant="hero" />
      </div>
    </div>
  );
};

export default Hero;
