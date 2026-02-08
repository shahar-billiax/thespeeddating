export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          body_html: string
          country_id: number
          created_at: string
          featured_image: string | null
          id: number
          is_published: boolean
          language_code: string
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          body_html: string
          country_id: number
          created_at?: string
          featured_image?: string | null
          id?: number
          is_published?: boolean
          language_code?: string
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          body_html?: string
          country_id?: number
          created_at?: string
          featured_image?: string | null
          id?: number
          is_published?: boolean
          language_code?: string
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: number
          id: number
          is_active: boolean
          name: string
          timezone: string
        }
        Insert: {
          country_id: number
          id?: number
          is_active?: boolean
          name: string
          timezone: string
        }
        Update: {
          country_id?: number
          id?: number
          is_active?: boolean
          name?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          currency: string
          default_locale: string
          domain: string
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          currency: string
          default_locale?: string
          domain: string
          id?: number
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          currency?: string
          default_locale?: string
          domain?: string
          id?: number
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          country_id: number
          id: number
          is_active: boolean
          language_code: string
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body_html: string
          country_id: number
          id?: number
          is_active?: boolean
          language_code: string
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          country_id?: number
          id?: number
          is_active?: boolean
          language_code?: string
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      event_hosts: {
        Row: {
          event_id: number
          id: number
          user_id: string
        }
        Insert: {
          event_id: number
          id?: number
          user_id: string
        }
        Update: {
          event_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_hosts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_hosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          admin_notes: string | null
          amount: number | null
          attended: boolean | null
          currency: string | null
          event_id: number
          guest_details: Json | null
          id: number
          paid_amount: number | null
          payment_status: string
          promotion_code_id: number | null
          registered_at: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          ticket_quantity: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          attended?: boolean | null
          currency?: string | null
          event_id: number
          guest_details?: Json | null
          id?: number
          paid_amount?: number | null
          payment_status?: string
          promotion_code_id?: number | null
          registered_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          ticket_quantity?: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          attended?: boolean | null
          currency?: string | null
          event_id?: number
          guest_details?: Json | null
          id?: number
          paid_amount?: number | null
          payment_status?: string
          promotion_code_id?: number | null
          registered_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          ticket_quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_promotion_code_id_fkey"
            columns: ["promotion_code_id"]
            isOneToOne: false
            referencedRelation: "promotion_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_max: number | null
          age_max_female: number | null
          age_max_male: number | null
          age_min: number | null
          age_min_female: number | null
          age_min_male: number | null
          city_id: number
          country_id: number
          created_at: string
          currency: string | null
          description: string | null
          dress_code: string | null
          enable_gendered_age: boolean
          enable_gendered_price: boolean
          end_time: string | null
          event_date: string
          event_type: string | null
          id: number
          is_cancelled: boolean
          is_published: boolean
          limit_female: number | null
          limit_male: number | null
          match_results_released: boolean
          match_submission_open: boolean
          price: number | null
          price_female: number | null
          price_male: number | null
          special_offer: string | null
          special_offer_value: number | null
          start_time: string | null
          updated_at: string
          venue_id: number | null
          vip_price: number | null
        }
        Insert: {
          age_max?: number | null
          age_max_female?: number | null
          age_max_male?: number | null
          age_min?: number | null
          age_min_female?: number | null
          age_min_male?: number | null
          city_id: number
          country_id: number
          created_at?: string
          currency?: string | null
          description?: string | null
          dress_code?: string | null
          enable_gendered_age?: boolean
          enable_gendered_price?: boolean
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: number
          is_cancelled?: boolean
          is_published?: boolean
          limit_female?: number | null
          limit_male?: number | null
          match_results_released?: boolean
          match_submission_open?: boolean
          price?: number | null
          price_female?: number | null
          price_male?: number | null
          special_offer?: string | null
          special_offer_value?: number | null
          start_time?: string | null
          updated_at?: string
          venue_id?: number | null
          vip_price?: number | null
        }
        Update: {
          age_max?: number | null
          age_max_female?: number | null
          age_max_male?: number | null
          age_min?: number | null
          age_min_female?: number | null
          age_min_male?: number | null
          city_id?: number
          country_id?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          dress_code?: string | null
          enable_gendered_age?: boolean
          enable_gendered_price?: boolean
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: number
          is_cancelled?: boolean
          is_published?: boolean
          limit_female?: number | null
          limit_male?: number | null
          match_results_released?: boolean
          match_submission_open?: boolean
          price?: number | null
          price_female?: number | null
          price_male?: number | null
          special_offer?: string | null
          special_offer_value?: number | null
          start_time?: string | null
          updated_at?: string
          venue_id?: number | null
          vip_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          category: string
          country_id: number
          created_at: string
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          category: string
          country_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
        }
        Update: {
          category?: string
          country_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          gallery_id: number
          id: number
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          gallery_id: number
          id?: number
          sort_order?: number
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          gallery_id?: number
          id?: number
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          computed_at: string
          event_id: number
          id: number
          result_type: string
          user_a_id: string
          user_a_shares: Json | null
          user_b_id: string
          user_b_shares: Json | null
        }
        Insert: {
          computed_at?: string
          event_id: number
          id?: number
          result_type: string
          user_a_id: string
          user_a_shares?: Json | null
          user_b_id: string
          user_b_shares?: Json | null
        }
        Update: {
          computed_at?: string
          event_id?: number
          id?: number
          result_type?: string
          user_a_id?: string
          user_a_shares?: Json | null
          user_b_id?: string
          user_b_shares?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scores: {
        Row: {
          choice: string
          event_id: number
          id: number
          is_active: boolean
          scored_id: string
          scorer_id: string
          share_email: boolean
          share_facebook: boolean
          share_instagram: boolean
          share_phone: boolean
          share_whatsapp: boolean
          submitted_at: string
        }
        Insert: {
          choice: string
          event_id: number
          id?: number
          is_active?: boolean
          scored_id: string
          scorer_id: string
          share_email?: boolean
          share_facebook?: boolean
          share_instagram?: boolean
          share_phone?: boolean
          share_whatsapp?: boolean
          submitted_at?: string
        }
        Update: {
          choice?: string
          event_id?: number
          id?: number
          is_active?: boolean
          scored_id?: string
          scorer_id?: string
          share_email?: boolean
          share_facebook?: boolean
          share_instagram?: boolean
          share_phone?: boolean
          share_whatsapp?: boolean
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scores_scored_id_fkey"
            columns: ["scored_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scores_scorer_id_fkey"
            columns: ["scorer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_packages: {
        Row: {
          country_id: number
          currency: string
          duration_months: number
          id: number
          is_active: boolean
          name: string
          num_dates: number
          price: number
        }
        Insert: {
          country_id: number
          currency: string
          duration_months: number
          id?: number
          is_active?: boolean
          name: string
          num_dates: number
          price: number
        }
        Update: {
          country_id?: number
          currency?: string
          duration_months?: number
          id?: number
          is_active?: boolean
          name?: string
          num_dates?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_packages_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_profiles: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: number
          package_type: string | null
          questionnaire_data: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: number
          package_type?: string | null
          questionnaire_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: number
          package_type?: string | null
          questionnaire_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_comments: string | null
          avatar_url: string | null
          bio: string | null
          city_id: number | null
          country_id: number | null
          created_at: string
          date_of_birth: string
          education: string | null
          email: string
          facebook: string | null
          faith: string | null
          first_name: string
          gender: string
          has_children: boolean | null
          height_cm: number | null
          id: string
          instagram: string | null
          interests: string | null
          is_active: boolean
          last_name: string
          occupation: string | null
          phone: string | null
          privacy_preferences: Json | null
          relationship_status: string | null
          role: string
          sexual_preference: string | null
          subscribed_email: boolean
          subscribed_phone: boolean
          subscribed_sms: boolean
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_comments?: string | null
          avatar_url?: string | null
          bio?: string | null
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          date_of_birth: string
          education?: string | null
          email: string
          facebook?: string | null
          faith?: string | null
          first_name: string
          gender: string
          has_children?: boolean | null
          height_cm?: number | null
          id: string
          instagram?: string | null
          interests?: string | null
          is_active?: boolean
          last_name: string
          occupation?: string | null
          phone?: string | null
          privacy_preferences?: Json | null
          relationship_status?: string | null
          role?: string
          sexual_preference?: string | null
          subscribed_email?: boolean
          subscribed_phone?: boolean
          subscribed_sms?: boolean
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_comments?: string | null
          avatar_url?: string | null
          bio?: string | null
          city_id?: number | null
          country_id?: number | null
          created_at?: string
          date_of_birth?: string
          education?: string | null
          email?: string
          facebook?: string | null
          faith?: string | null
          first_name?: string
          gender?: string
          has_children?: boolean | null
          height_cm?: number | null
          id?: string
          instagram?: string | null
          interests?: string | null
          is_active?: boolean
          last_name?: string
          occupation?: string | null
          phone?: string | null
          privacy_preferences?: Json | null
          relationship_status?: string | null
          role?: string
          sexual_preference?: string | null
          subscribed_email?: boolean
          subscribed_phone?: boolean
          subscribed_sms?: boolean
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_codes: {
        Row: {
          code: string
          country_id: number
          created_at: string
          event_id: number | null
          id: number
          is_active: boolean
          is_percentage: boolean
          max_uses: number | null
          times_used: number
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          code: string
          country_id: number
          created_at?: string
          event_id?: number | null
          id?: number
          is_active?: boolean
          is_percentage?: boolean
          max_uses?: number | null
          times_used?: number
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string
          country_id?: number
          created_at?: string
          event_id?: number | null
          id?: number
          is_active?: boolean
          is_percentage?: boolean
          max_uses?: number | null
          times_used?: number
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_codes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          clicked_at: string | null
          country_id: number
          date_added: string
          date_scheduled: string | null
          date_sent: string | null
          email_address: string
          event_id: number | null
          id: number
          is_read: boolean
          link_clicked: boolean
          read_at: string | null
          recipient_name: string | null
          sendgrid_message_id: string | null
          status: string
          subject: string
          template_key: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          country_id: number
          date_added?: string
          date_scheduled?: string | null
          date_sent?: string | null
          email_address: string
          event_id?: number | null
          id?: number
          is_read?: boolean
          link_clicked?: boolean
          read_at?: string | null
          recipient_name?: string | null
          sendgrid_message_id?: string | null
          status?: string
          subject: string
          template_key?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          country_id?: number
          date_added?: string
          date_scheduled?: string | null
          date_sent?: string | null
          email_address?: string
          event_id?: number | null
          id?: number
          is_read?: boolean
          link_clicked?: boolean
          read_at?: string | null
          recipient_name?: string | null
          sendgrid_message_id?: string | null
          status?: string
          subject?: string
          template_key?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_emails_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          id: number
          language_code: string
          string_key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: number
          language_code: string
          string_key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: number
          language_code?: string
          string_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      venue_images: {
        Row: {
          id: number
          sort_order: number
          storage_path: string
          venue_id: number
        }
        Insert: {
          id?: number
          sort_order?: number
          storage_path: string
          venue_id: number
        }
        Update: {
          id?: number
          sort_order?: number
          storage_path?: string
          venue_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "venue_images_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          city_id: number
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          country_id: number
          created_at: string
          description: string | null
          dress_code: string | null
          id: number
          internal_notes: string | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          map_url: string | null
          name: string
          phone: string | null
          transport_info: string | null
          updated_at: string
          venue_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id: number
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          country_id: number
          created_at?: string
          description?: string | null
          dress_code?: string | null
          id?: number
          internal_notes?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name: string
          phone?: string | null
          transport_info?: string | null
          updated_at?: string
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: number
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          country_id?: number
          created_at?: string
          description?: string | null
          dress_code?: string | null
          id?: number
          internal_notes?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          name?: string
          phone?: string | null
          transport_info?: string | null
          updated_at?: string
          venue_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: number
          plan_type: string
          price_per_month: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_type: string
          price_per_month: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_type?: string
          price_per_month?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_matches: { Args: { p_event_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

