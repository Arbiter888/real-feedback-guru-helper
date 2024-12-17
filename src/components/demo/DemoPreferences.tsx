import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DemoPreferencesProps {
  onPreferencesSaved: (name: string, url: string) => void;
}

export const DemoPreferences = ({ onPreferencesSaved }: DemoPreferencesProps) => {
  const [restaurantName, setRestaurantName] = useState("The Local Kitchen & Bar");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://maps.app.goo.gl/Nx23mQHet4TBfctJ6");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDemoPreferences = async () => {
      const { data, error } = await supabase
        .from('demo_preferences')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setRestaurantName(data.restaurant_name);
        setGoogleMapsUrl(data.google_maps_url);
        onPreferencesSaved(data.restaurant_name, data.google_maps_url);
      }
    };

    fetchDemoPreferences();
  }, [onPreferencesSaved]);

  const handleSavePreferences = async () => {
    if (!restaurantName.trim() || !googleMapsUrl.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both restaurant name and Google Maps URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('demo_preferences')
        .insert({
          restaurant_name: restaurantName,
          google_maps_url: googleMapsUrl,
        });

      if (error) throw error;

      onPreferencesSaved(restaurantName, googleMapsUrl);
      toast({
        title: "Preferences saved!",
        description: "Your demo has been customized successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="restaurantName">Restaurant Name</Label>
        <Input
          id="restaurantName"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          placeholder="Enter your restaurant name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
        <Input
          id="googleMapsUrl"
          value={googleMapsUrl}
          onChange={(e) => setGoogleMapsUrl(e.target.value)}
          placeholder="Paste your Google Maps link"
        />
      </div>
      <Button 
        onClick={handleSavePreferences}
        disabled={isSaving}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isSaving ? "Saving..." : "Save Demo Preferences"}
      </Button>
    </div>
  );
};