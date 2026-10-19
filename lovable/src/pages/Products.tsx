import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { products, collections, getCollectionBySlug } from "@/data/products";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";
type PriceRange = "all" | "under-100" | "100-500" | "500-1000" | "over-1000";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Alphabetical A-Z" },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: "all", label: "All Prices" },
  { value: "under-100", label: "Under $100" },
  { value: "100-500", label: "$100 - $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "over-1000", label: "Over $1,000" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get("collection") || "all";
  const activeSort = (searchParams.get("sort") as SortOption) || "featured";
  const activeMaterial = searchParams.get("material") || "all";
  const activePriceRange = (searchParams.get("price") as PriceRange) || "all";
  const showNew = searchParams.get("new") === "true";
  const showFeatured = searchParams.get("featured") === "true";

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach((product) => {
      const primary = product.materials.split(",")[0].trim();
      if (primary) materials.add(primary);
    });
    return Array.from(materials).sort();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by collection
    if (activeCollection !== "all") {
      const collection = collections.find((c) => c.slug === activeCollection);
      if (collection) {
        result = result.filter((product) => product.collection === collection.id);
      }
    }

    // Filter by material
    if (activeMaterial !== "all") {
      result = result.filter((product) =>
        product.materials.toLowerCase().includes(activeMaterial.toLowerCase())
      );
    }

    // Filter by price range
    if (activePriceRange !== "all") {
      result = result.filter((product) => {
        switch (activePriceRange) {
          case "under-100":
            return product.price < 100;
          case "100-500":
            return product.price >= 100 && product.price <= 500;
          case "500-1000":
            return product.price > 500 && product.price <= 1000;
          case "over-1000":
            return product.price > 1000;
          default:
            return true;
        }
      });
    }

    // Quick filters
    if (showNew) {
      result = result.filter((product) => product.new);
    }
    if (showFeatured) {
      result = result.filter((product) => product.featured);
    }

    // Sort
    switch (activeSort) {
      case "newest":
        result = result.filter((p) => p.new).concat(result.filter((p) => !p.new));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        result = result.filter((p) => p.featured).concat(result.filter((p) => !p.featured));
        break;
    }

    return result;
  }, [activeCollection, activeSort, activeMaterial, activePriceRange, showNew, showFeatured]);

  const currentCollection = activeCollection !== "all"
    ? getCollectionBySlug(activeCollection)
    : null;

  const activeFilterCount = [
    activeCollection !== "all",
    activeMaterial !== "all",
    activePriceRange !== "all",
    showNew,
    showFeatured,
  ].filter(Boolean).length;

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === "all" || value === "false") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (slug: string) => {
    updateParam("collection", slug === "all" ? null : slug);
  };

  const handleSortChange = (value: string) => {
    updateParam("sort", value === "featured" ? null : value);
  };

  const handleMaterialChange = (value: string) => {
    updateParam("material", value === "all" ? null : value);
  };

  const handlePriceRangeChange = (value: string) => {
    updateParam("price", value === "all" ? null : value);
  };

  const toggleNew = () => {
    updateParam("new", showNew ? null : "true");
  };

  const toggleFeatured = () => {
    updateParam("featured", showFeatured ? null : "true");
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (activeSort !== "featured") {
      newParams.set("sort", activeSort);
    }
    setSearchParams(newParams);
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              currentCollection?.heroImage ||
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            }
            alt={currentCollection?.name || "All Products"}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-charcoal/10" />
        </div>

        <div className="relative container-full h-full flex flex-col justify-end pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/50 mb-3">
              {currentCollection ? "Collection" : "Shop"}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-3 leading-[0.95]">
              {currentCollection ? currentCollection.name : "All Pieces"}
            </h1>
            {currentCollection && (
              <p className="text-base text-white/70 max-w-lg">
                {currentCollection.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="py-5 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container-full">
          <div className="flex flex-col gap-4">
            {/* Row 1: Collection filters + Sort */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Collection Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mb-2 md:mb-0 scrollbar-hide">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className={cn(
                    "rounded-none px-5 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all duration-300",
                    activeCollection === "all"
                      ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                      : "hover:bg-accent"
                  )}
                >
                  All
                </Button>
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange(collection.slug)}
                    className={cn(
                      "rounded-none px-5 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all duration-300",
                      activeCollection === collection.slug
                        ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                        : "hover:bg-accent"
                    )}
                  >
                    {collection.name}
                  </Button>
                ))}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground tracking-[0.1em] uppercase">
                  Sort by
                </span>
                <Select value={activeSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] rounded-none text-xs tracking-[0.05em] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Quick filters + Material + Price */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
              {/* Quick filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNew}
                className={cn(
                  "rounded-none px-4 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all duration-300",
                  showNew
                    ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                    : "hover:bg-accent"
                )}
              >
                New In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFeatured}
                className={cn(
                  "rounded-none px-4 whitespace-nowrap text-xs tracking-[0.1em] uppercase transition-all duration-300",
                  showFeatured
                    ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                    : "hover:bg-accent"
                )}
              >
                Featured
              </Button>

              <div className="w-px h-6 bg-border hidden sm:block" />

              {/* Material filter */}
              <Select value={activeMaterial} onValueChange={handleMaterialChange}>
                <SelectTrigger className="w-[160px] rounded-none text-xs tracking-[0.05em] h-9">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Materials
                  </SelectItem>
                  {availableMaterials.map((material) => (
                    <SelectItem key={material} value={material} className="text-xs">
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price range filter */}
              <Select value={activePriceRange} onValueChange={handlePriceRangeChange}>
                <SelectTrigger className="w-[150px] rounded-none text-xs tracking-[0.05em] h-9">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="text-xs">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-none px-3 text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-14 md:py-20">
        <div className="container-full">
          {filteredAndSortedProducts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <p className="text-sm text-muted-foreground">
                  {filteredAndSortedProducts.length}{" "}
                  {filteredAndSortedProducts.length === 1 ? "piece" : "pieces"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {filteredAndSortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-28">
              <p className="font-serif text-2xl text-muted-foreground mb-4">
                No pieces found
              </p>
              <p className="text-muted-foreground mb-8">
                Try adjusting your filters to discover more pieces.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-none px-8 text-sm tracking-[0.1em] uppercase"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Interior lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/50 mb-4">
              Need Assistance?
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
              We're Here to Help
            </h2>
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase bg-white text-charcoal hover:bg-white/90"
            >
              <a href="mailto:hello@maison.com">
                Contact Us
                <ArrowRight className="ml-3 w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
