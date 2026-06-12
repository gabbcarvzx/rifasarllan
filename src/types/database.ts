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

export type ISODateTime = string;

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
  logo_url: string | null;
  primary_color: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
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
  image_url: string;
  alt_text: string | null;
  order_index: number;
  created_at: ISODateTime;
};

export type RafflePrize = {
  id: string;
  raffle_id: string;
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
  amount: number | null;
  status: PaymentStatus;
  paid_at: ISODateTime | null;
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
  created_at: ISODateTime;
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
              | "logo_url"
              | "primary_color"
              | "whatsapp_number"
              | "instagram_url"
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
          Partial<Pick<RaffleImage, "id" | "alt_text" | "order_index">>;
        Update: Partial<Omit<RaffleImage, "id" | "raffle_id" | "created_at">>;
        Relationships: [];
      };
      raffle_prizes: {
        Row: RafflePrize;
        Insert: Pick<RafflePrize, "raffle_id" | "title"> &
          Partial<
            Pick<RafflePrize, "id" | "description" | "image_url" | "position" | "quantity">
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
              | "amount"
              | "status"
              | "paid_at"
            >
          >;
        Update: Partial<Omit<Payment, "id" | "order_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      winners: {
        Row: Winner;
        Insert: Pick<Winner, "tenant_id" | "raffle_id" | "number"> &
          Partial<
            Pick<
              Winner,
              "id" | "prize_id" | "user_id" | "order_id" | "winner_name" | "winner_phone" | "drawn_at"
            >
          >;
        Update: Partial<Omit<Winner, "id" | "tenant_id" | "created_at">>;
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
