export type ProfileRole = "admin" | "customer";

export type TenantStatus = "active" | "inactive";

export type RaffleStatus =
  | "draft"
  | "active"
  | "paused"
  | "finished"
  | "cancelled";

export type RaffleNumberStatus =
  | "available"
  | "reserved"
  | "paid"
  | "cancelled";

export type OrderStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type MediaBucketName =
  | "raffle-images"
  | "prize-images"
  | "platform-assets"
  | "winners"
  | "temporary";

export type ISODateTime = string;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: ProfileRole;
  tenant_id: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  status: TenantStatus;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PlatformSettings = {
  id: string;
  tenant_id: string;
  platform_name: string;
  platform_subtitle: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  support_email: string | null;
  footer_text: string | null;
  privacy_policy: string | null;
  terms_of_use: string | null;
  seo_title: string | null;
  seo_description: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Raffle = {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  rules: string | null;
  price_per_number: number;
  total_numbers: number;
  min_number: number;
  max_number: number;
  draw_date: ISODateTime | null;
  status: RaffleStatus;
  main_image_url: string | null;
  featured: boolean;
  created_by: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type RaffleImage = {
  id: string;
  raffle_id: string;
  media_file_id: string | null;
  image_url: string;
  alt_text: string | null;
  order_index: number;
  created_at: ISODateTime;
};

export type RafflePrize = {
  id: string;
  raffle_id: string;
  media_file_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  position: number;
  quantity: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type RaffleNumber = {
  id: string;
  raffle_id: string;
  number: number;
  status: RaffleNumberStatus;
  user_id: string | null;
  reserved_until: ISODateTime | null;
  order_id: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PublicRaffleNumber = Pick<
  RaffleNumber,
  "id" | "raffle_id" | "number" | "status"
>;

export type ReserveRaffleNumbersResult = {
  order_id: string;
  amount: number;
  reserved_until: ISODateTime;
  reserved_numbers: number[];
};

export type ExpireOldReservationsResult = {
  expired_orders: number;
  released_numbers: number;
};

export type Order = {
  id: string;
  tenant_id: string;
  user_id: string | null;
  raffle_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  amount: number;
  status: OrderStatus;
  payment_method: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type OrderItem = {
  id: string;
  order_id: string;
  raffle_number_id: string;
  number: number;
  price: number;
  created_at: ISODateTime;
};

export type Payment = {
  id: string;
  order_id: string;
  provider: string | null;
  provider_payment_id: string | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  provider_raw_status: string | null;
  invoice_url: string | null;
  expires_at: ISODateTime | null;
  due_date: string | null;
  pix_end_to_end_identifier: string | null;
  last_provider_sync: ISODateTime | null;
  provider_response: Json | null;
  amount: number | null;
  status: PaymentStatus;
  paid_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type AsaasCustomer = {
  id: string;
  tenant_id: string;
  user_id: string;
  asaas_customer_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Winner = {
  id: string;
  tenant_id: string;
  raffle_id: string;
  prize_id: string | null;
  user_id: string | null;
  order_id: string | null;
  number: number;
  winner_name: string | null;
  winner_phone: string | null;
  drawn_at: ISODateTime;
  draw_source: string | null;
  instagram_live_url: string | null;
  proof_url: string | null;
  notes: string | null;
  published: boolean;
  published_at: ISODateTime | null;
  created_by: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PublicResultRaffleRow = Pick<
  Raffle,
  "id" | "title" | "slug" | "main_image_url" | "status" | "draw_date"
>;

export type PublicManualResultRow = {
  winner_id: string;
  raffle_id: string;
  prize_id: string | null;
  prize_title: string;
  prize_description: string | null;
  prize_image_url: string | null;
  prize_position: number;
  number: number;
  winner_name: string;
  drawn_at: ISODateTime;
  draw_source: string;
  instagram_live_url: string | null;
  proof_url: string | null;
  published_at: ISODateTime;
};

export type MediaFile = {
  id: string;
  tenant_id: string;
  bucket_name: MediaBucketName;
  file_name: string;
  original_name: string | null;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Pick<Profile, "full_name" | "email" | "phone" | "role" | "tenant_id">> & {
          id: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      tenants: {
        Row: Tenant;
        Insert: Pick<Tenant, "name" | "slug"> &
          Partial<Pick<Tenant, "id" | "owner_id" | "status">>;
        Update: Partial<Omit<Tenant, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      platform_settings: {
        Row: PlatformSettings;
        Insert: Pick<PlatformSettings, "tenant_id" | "platform_name"> &
          Partial<
            Pick<
              PlatformSettings,
              | "id"
              | "platform_subtitle"
              | "logo_url"
              | "favicon_url"
              | "hero_banner_url"
              | "primary_color"
              | "secondary_color"
              | "whatsapp_number"
              | "instagram_url"
              | "facebook_url"
              | "youtube_url"
              | "support_email"
              | "footer_text"
              | "privacy_policy"
              | "terms_of_use"
              | "seo_title"
              | "seo_description"
              | "hero_title"
              | "hero_subtitle"
            >
          >;
        Update: Partial<
          Omit<PlatformSettings, "id" | "tenant_id" | "created_at" | "updated_at">
        >;
        Relationships: [];
      };
      raffles: {
        Row: Raffle;
        Insert: Pick<
          Raffle,
          "tenant_id" | "title" | "slug" | "price_per_number" | "total_numbers" | "max_number"
        > &
          Partial<
            Pick<
              Raffle,
              | "id"
              | "short_description"
              | "description"
              | "rules"
              | "min_number"
              | "draw_date"
              | "status"
              | "main_image_url"
              | "featured"
              | "created_by"
            >
          >;
        Update: Partial<Omit<Raffle, "id" | "tenant_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      raffle_images: {
        Row: RaffleImage;
        Insert: Pick<RaffleImage, "raffle_id" | "image_url"> &
          Partial<
            Pick<RaffleImage, "id" | "media_file_id" | "alt_text" | "order_index">
          >;
        Update: Partial<Omit<RaffleImage, "id" | "raffle_id" | "created_at">>;
        Relationships: [];
      };
      raffle_prizes: {
        Row: RafflePrize;
        Insert: Pick<RafflePrize, "raffle_id" | "title"> &
          Partial<
            Pick<
              RafflePrize,
              | "id"
              | "media_file_id"
              | "description"
              | "image_url"
              | "position"
              | "quantity"
            >
          >;
        Update: Partial<Omit<RafflePrize, "id" | "raffle_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      raffle_numbers: {
        Row: RaffleNumber;
        Insert: Pick<RaffleNumber, "raffle_id" | "number"> &
          Partial<
            Pick<
              RaffleNumber,
              "id" | "status" | "user_id" | "reserved_until" | "order_id"
            >
          >;
        Update: Partial<Omit<RaffleNumber, "id" | "raffle_id" | "number" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Pick<Order, "tenant_id" | "raffle_id" | "amount"> &
          Partial<
            Pick<
              Order,
              | "id"
              | "user_id"
              | "customer_name"
              | "customer_email"
              | "customer_phone"
              | "status"
              | "payment_method"
            >
          >;
        Update: Partial<Omit<Order, "id" | "tenant_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Pick<OrderItem, "order_id" | "raffle_number_id" | "number" | "price"> &
          Partial<Pick<OrderItem, "id">>;
        Update: Partial<Omit<OrderItem, "id" | "order_id" | "created_at">>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Pick<Payment, "order_id"> &
          Partial<
            Pick<
              Payment,
              | "id"
              | "provider"
              | "provider_payment_id"
              | "pix_qr_code"
              | "pix_copy_paste"
              | "provider_raw_status"
              | "invoice_url"
              | "expires_at"
              | "due_date"
              | "pix_end_to_end_identifier"
              | "last_provider_sync"
              | "provider_response"
              | "amount"
              | "status"
              | "paid_at"
            >
          >;
        Update: Partial<Omit<Payment, "id" | "order_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      asaas_customers: {
        Row: AsaasCustomer;
        Insert: Pick<
          AsaasCustomer,
          | "tenant_id"
          | "user_id"
          | "asaas_customer_id"
          | "name"
          | "email"
        > &
          Partial<Pick<AsaasCustomer, "id" | "phone">>;
        Update: Partial<
          Omit<
            AsaasCustomer,
            "id" | "tenant_id" | "user_id" | "created_at" | "updated_at"
          >
        >;
        Relationships: [];
      };
      winners: {
        Row: Winner;
        Insert: Pick<Winner, "tenant_id" | "raffle_id" | "number"> &
          Partial<
            Pick<
              Winner,
              | "id"
              | "prize_id"
              | "user_id"
              | "order_id"
              | "winner_name"
              | "winner_phone"
              | "drawn_at"
              | "draw_source"
              | "instagram_live_url"
              | "proof_url"
              | "notes"
              | "published"
              | "published_at"
              | "created_by"
            >
          >;
        Update: Partial<Omit<Winner, "id" | "tenant_id" | "created_at">>;
        Relationships: [];
      };
      media_files: {
        Row: MediaFile;
        Insert: Pick<
          MediaFile,
          | "tenant_id"
          | "bucket_name"
          | "file_name"
          | "mime_type"
          | "file_size"
          | "storage_path"
        > &
          Partial<
            Pick<
              MediaFile,
              | "id"
              | "original_name"
              | "public_url"
              | "width"
              | "height"
              | "uploaded_by"
              | "is_active"
            >
          >;
        Update: Partial<
          Omit<MediaFile, "id" | "tenant_id" | "created_at" | "updated_at">
        >;
        Relationships: [];
      };
    };
    Views: {
      public_raffle_numbers: {
        Row: PublicRaffleNumber;
        Relationships: [];
      };
    };
    Functions: {
      current_tenant_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin_for_tenant: {
        Args: { p_tenant_id: string };
        Returns: boolean;
      };
      generate_raffle_numbers: {
        Args: { p_raffle_id: string };
        Returns: number;
      };
      reserve_raffle_numbers: {
        Args: {
          p_raffle_id: string;
          p_numbers: number[];
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
        };
        Returns: ReserveRaffleNumbersResult[];
      };
      expire_old_reservations: {
        Args: Record<string, never>;
        Returns: ExpireOldReservationsResult[];
      };
      get_admin_dashboard_stats: {
        Args: { p_tenant_id: string };
        Returns: Json;
      };
      get_public_result_raffle: {
        Args: { p_slug: string; p_tenant_id: string };
        Returns: PublicResultRaffleRow[];
      };
      get_public_manual_results: {
        Args: { p_raffle_id: string; p_tenant_id: string };
        Returns: PublicManualResultRow[];
      };
      sync_asaas_payment: {
        Args: {
          p_payment_id: string;
          p_status: PaymentStatus;
          p_provider_raw_status: string | null;
          p_provider_payment_id: string | null;
          p_pix_copy_paste: string | null;
          p_pix_qr_code: string | null;
          p_invoice_url: string | null;
          p_expires_at: string | null;
          p_due_date: string | null;
          p_pix_end_to_end_identifier: string | null;
          p_provider_response: Json | null;
        };
        Returns: undefined;
      };
      storage_object_tenant_id: {
        Args: { p_name: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
