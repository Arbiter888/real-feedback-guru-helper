import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const generateUniqueSlug = (baseName: string) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}-${randomString}`;
};

interface CreateDemoButtonProps {
  onPageCreated?: (url: string) => void;
}

export const CreateDemoButton = ({ onPageCreated }: CreateDemoButtonProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateCustomDemo = async () => {
    try {
      setIsCreating(true);
      const savedPreferences = localStorage.getItem('demoPreferences');
      
      if (!savedPreferences) {
        toast({
          title: "Missing preferences",
          description: "Please set your restaurant preferences first.",
          variant: "destructive",
        });
        return;
      }

      const { restaurantName, googleMapsUrl, contactEmail } = JSON.parse(savedPreferences);
      if (!restaurantName || !googleMapsUrl) {
        toast({
          title: "Missing preferences",
          description: "Please set your restaurant preferences first.",
          variant: "destructive",
        });
        return;
      }

      const uniqueSlug = generateUniqueSlug(restaurantName);

      const { data, error } = await supabase
        .from('demo_pages')
        .insert([
          {
            restaurant_name: restaurantName,
            google_maps_url: googleMapsUrl,
            contact_email: contactEmail,
            slug: uniqueSlug,
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const lovableUrl = `https://32802680-4753-4ba5-98e8-7b0522c3f6f0.lovableproject.com/demo/${uniqueSlug}`;
      await navigator.clipboard.writeText(lovableUrl);

      toast({
        title: "Review page created!",
        description: "The URL has been copied to your clipboard.",
      });

      if (onPageCreated) {
        onPageCreated(`/demo/${uniqueSlug}`);
      }

    } catch (error) {
      console.error('Error creating demo:', error);
      toast({
        title: "Error",
        description: "Failed to create review page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateCustomDemo}
      disabled={isCreating}
      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 md:py-6"
    >
      {isCreating ? "Creating..." : "Create Your Review Page"}
      <Link2 className="ml-2 h-4 w-4 md:h-5 md:w-5" />
    </Button>
  );
};