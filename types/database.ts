export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      designs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          tags: string[];
          price: number;
          mrp: number;
          colors: { name: string; hex: string; inStock?: boolean }[];
          sizes: string[];
          design_image_url: string;
          placement: 'chest' | 'center' | 'back';
          design_scale: number;
          status: 'draft' | 'published';
          is_featured: boolean;
          is_new_drop: boolean;
          is_sold_out: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          tags?: string[];
          price: number;
          mrp: number;
          colors?: { name: string; hex: string; inStock?: boolean }[];
          sizes?: string[];
          design_image_url: string;
          placement?: 'chest' | 'center' | 'back';
          design_scale?: number;
          status?: 'draft' | 'published';
          is_featured?: boolean;
          is_new_drop?: boolean;
          is_sold_out?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category_id?: string | null;
          tags?: string[];
          price?: number;
          mrp?: number;
          colors?: { name: string; hex: string; inStock?: boolean }[];
          sizes?: string[];
          design_image_url?: string;
          placement?: 'chest' | 'center' | 'back';
          design_scale?: number;
          status?: 'draft' | 'published';
          is_featured?: boolean;
          is_new_drop?: boolean;
          is_sold_out?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      design_images: {
        Row: {
          id: string;
          design_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          design_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          lead_code: string;
          session_id: string;
          design_id: string | null;
          size: string | null;
          color: string | null;
          assigned_whatsapp_number: string;
          source: string;
          status: 'new' | 'contacted' | 'confirmed' | 'paid' | 'printing' | 'shipped' | 'delivered' | 'cancelled' | 'spam';
          customer_name: string | null;
          customer_phone: string | null;
          shipping_address: string | null;
          cost_price: number;
          sale_price: number;
          printer_notes: string | null;
          user_agent: string | null;
          ip_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_code?: string;
          session_id: string;
          design_id?: string | null;
          size?: string | null;
          color?: string | null;
          assigned_whatsapp_number: string;
          source?: string;
          status?: 'new' | 'contacted' | 'confirmed' | 'paid' | 'printing' | 'shipped' | 'delivered' | 'cancelled' | 'spam';
          customer_name?: string | null;
          customer_phone?: string | null;
          shipping_address?: string | null;
          cost_price?: number;
          sale_price?: number;
          printer_notes?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_code?: string;
          session_id?: string;
          design_id?: string | null;
          size?: string | null;
          color?: string | null;
          assigned_whatsapp_number?: string;
          source?: string;
          status?: 'new' | 'contacted' | 'confirmed' | 'paid' | 'printing' | 'shipped' | 'delivered' | 'cancelled' | 'spam';
          customer_name?: string | null;
          customer_phone?: string | null;
          shipping_address?: string | null;
          cost_price?: number;
          sale_price?: number;
          printer_notes?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          event_name: string;
          event_type?: string | null;
          banner_id?: string | null;
          session_id: string;
          design_id: string | null;
          path: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          event_type?: string | null;
          banner_id?: string | null;
          session_id: string;
          design_id?: string | null;
          path?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          event_type?: string | null;
          banner_id?: string | null;
          session_id?: string;
          design_id?: string | null;
          path?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          cta_text: string | null;
          link_type: 'none' | 'design' | 'category' | 'shop' | 'whatsapp' | 'custom';
          link_target: string | null;
          desktop_image_url: string;
          mobile_image_url: string | null;
          text_mode: 'overlay' | 'image_only';
          text_align: 'left' | 'center' | 'right';
          text_color: 'light' | 'dark';
          overlay_opacity: number;
          is_active: boolean;
          start_at: string | null;
          end_at: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          cta_text?: string | null;
          link_type?: 'none' | 'design' | 'category' | 'shop' | 'whatsapp' | 'custom';
          link_target?: string | null;
          desktop_image_url: string;
          mobile_image_url?: string | null;
          text_mode?: 'overlay' | 'image_only';
          text_align?: 'left' | 'center' | 'right';
          text_color?: 'light' | 'dark';
          overlay_opacity?: number;
          is_active?: boolean;
          start_at?: string | null;
          end_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          cta_text?: string | null;
          link_type?: 'none' | 'design' | 'category' | 'shop' | 'whatsapp' | 'custom';
          link_target?: string | null;
          desktop_image_url?: string;
          mobile_image_url?: string | null;
          text_mode?: 'overlay' | 'image_only';
          text_align?: 'left' | 'center' | 'right';
          text_color?: 'light' | 'dark';
          overlay_opacity?: number;
          is_active?: boolean;
          start_at?: string | null;
          end_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      home_sections: {
        Row: {
          id: string;
          key: string;
          title: string | null;
          subtitle: string | null;
          enabled: boolean;
          sort_order: number;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title?: string | null;
          subtitle?: string | null;
          enabled?: boolean;
          sort_order?: number;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string | null;
          subtitle?: string | null;
          enabled?: boolean;
          sort_order?: number;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          id: string;
          type: string;
          title: string;
          subtitle: string | null;
          content: string | null;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          subtitle?: string | null;
          content?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          subtitle?: string | null;
          content?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          location: 'header' | 'footer';
          label: string;
          url: string;
          sort_order: number;
          is_active: boolean;
          open_in_new_tab: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location: 'header' | 'footer';
          label: string;
          url: string;
          sort_order?: number;
          is_active?: boolean;
          open_in_new_tab?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location?: 'header' | 'footer';
          label?: string;
          url?: string;
          sort_order?: number;
          is_active?: boolean;
          open_in_new_tab?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: string;
          seo_title: string | null;
          seo_description: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content: string;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          brand_name: string;
          tagline: string;
          description: string;
          accent_color: string;
          whatsapp_numbers: string[];
          last_whatsapp_index: number;
          email: string;
          announcement_bar: string;
          announcement_enabled: boolean;
          announcement_link: string | null;
          announcement_start_at: string | null;
          announcement_end_at: string | null;
          shipping_info: string;
          return_policy: string;
          banner_autoplay_ms: number;
          banner_transition: string;
          banner_autoplay_enabled: boolean;
          whatsapp_enabled: boolean;
          maintenance_mode: boolean;
          logo_url: string | null;
          favicon_url: string | null;
          og_image_url: string | null;
          social_links: { instagram?: string; twitter?: string; whatsapp?: string };
          footer_text: string | null;
          seo_title: string | null;
          seo_description: string | null;
          size_guide_content: {
            note: string;
            sizes: { size: string; chest: string; length: string }[];
          };
          testimonials: { name: string; review: string; rating: number; location?: string }[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_name?: string;
          tagline?: string;
          description?: string;
          accent_color?: string;
          whatsapp_numbers?: string[];
          last_whatsapp_index?: number;
          email?: string;
          announcement_bar?: string;
          announcement_enabled?: boolean;
          announcement_link?: string | null;
          announcement_start_at?: string | null;
          announcement_end_at?: string | null;
          shipping_info?: string;
          return_policy?: string;
          banner_autoplay_ms?: number;
          banner_transition?: string;
          banner_autoplay_enabled?: boolean;
          whatsapp_enabled?: boolean;
          maintenance_mode?: boolean;
          logo_url?: string | null;
          favicon_url?: string | null;
          og_image_url?: string | null;
          social_links?: { instagram?: string; twitter?: string; whatsapp?: string };
          footer_text?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          size_guide_content?: {
            note: string;
            sizes: { size: string; chest: string; length: string }[];
          };
          testimonials?: { name: string; review: string; rating: number; location?: string }[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_name?: string;
          tagline?: string;
          description?: string;
          accent_color?: string;
          whatsapp_numbers?: string[];
          last_whatsapp_index?: number;
          email?: string;
          announcement_bar?: string;
          announcement_enabled?: boolean;
          announcement_link?: string | null;
          announcement_start_at?: string | null;
          announcement_end_at?: string | null;
          shipping_info?: string;
          return_policy?: string;
          banner_autoplay_ms?: number;
          banner_transition?: string;
          banner_autoplay_enabled?: boolean;
          whatsapp_enabled?: boolean;
          maintenance_mode?: boolean;
          logo_url?: string | null;
          favicon_url?: string | null;
          og_image_url?: string | null;
          social_links?: { instagram?: string; twitter?: string; whatsapp?: string };
          footer_text?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          size_guide_content?: {
            note: string;
            sizes: { size: string; chest: string; length: string }[];
          };
          testimonials?: { name: string; review: string; rating: number; location?: string }[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_or_reuse_lead: {
        Args: {
          p_session_id: string;
          p_design_id?: string | null;
          p_size?: string | null;
          p_color?: string | null;
          p_source?: string;
          p_user_agent?: string | null;
          p_ip_hash?: string | null;
        };
        Returns: {
          lead_id: string;
          lead_code: string;
          assigned_whatsapp_number: string;
          is_reused: boolean;
          created_at: string;
        }[];
      };
      get_dashboard_metrics: {
        Args: {
          p_start_date?: string | null;
          p_end_date?: string | null;
        };
        Returns: {
          total_leads: number;
          total_chats: number;
          total_orders: number;
          conversion_rate: number;
          total_revenue: number;
          total_profit: number;
          page_views: number;
          product_views: number;
        }[];
      };
      get_daily_analytics: {
        Args: {
          p_days?: number;
        };
        Returns: {
          day_date: string;
          views: number;
          leads: number;
          orders: number;
          revenue: number;
        }[];
      };
      get_top_designs: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          design_id: string;
          title: string;
          slug: string;
          price: number;
          lead_count: number;
          order_count: number;
          revenue: number;
        }[];
      };
      get_whatsapp_routing_stats: {
        Args: Record<string, never>;
        Returns: {
          phone_number: string;
          lead_count: number;
        }[];
      };
      get_banner_click_stats: {
        Args: Record<string, never>;
        Returns: {
          banner_id: string;
          click_count: number;
        }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Design = Database['public']['Tables']['designs']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
export type DesignImage = Database['public']['Tables']['design_images']['Row'];
export type Banner = Database['public']['Tables']['banners']['Row'];
export type HomeSection = Database['public']['Tables']['home_sections']['Row'];
export type ContentBlock = Database['public']['Tables']['content_blocks']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type CustomPage = Database['public']['Tables']['pages']['Row'];
export type Page = CustomPage;
