CREATE TABLE IF NOT EXISTS dashboard_metrics (
    _pk_dashboard_metric_id varchar(80) PRIMARY KEY DEFAULT ('dmetric_'::text || gen_random_uuid()::text),
    metric_key varchar(50) NOT NULL,
    metric_label varchar(100) NOT NULL,
    day_of_week varchar(10),
    slot_index integer,
    metric_value numeric(10,2) NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_notifications (
    _pk_dashboard_notification_id varchar(80) PRIMARY KEY DEFAULT ('dnotif_'::text || gen_random_uuid()::text),
    order_id varchar(40) NOT NULL,
    order_number varchar(40) NOT NULL,
    category varchar(100) NOT NULL,
    weight varchar(50) NOT NULL,
    company varchar(100) NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    route varchar(150) NOT NULL,
    price numeric(12,2) NOT NULL,
    status varchar(30) NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now()
);

INSERT INTO dashboard_metrics (metric_key, metric_label, metric_value)
VALUES
    ('minimum_number', 'Minimum number', 97),
    ('average_number', 'Average number', 120),
    ('maximum_number', 'Maximum number', 259)
ON CONFLICT DO NOTHING;

-- Seed a real order set so dashboard notifications match the orders table.
-- Use the actual admin user id created by the app, or update it to your current user id.
INSERT INTO addresses (
    _pk_address_id,
    _fk_user_id,
    recipient_name,
    phone,
    line1,
    barangay,
    city,
    province,
    postal_code,
    country,
    is_default,
    created_at,
    updated_at,
    address_type
)
VALUES
    ('adr-demo-1', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'Admin User', '09171234567', 'Unit 4C, BGC Tower', 'Bonifacio Global City', 'Taguig', 'Metro Manila', '1634', 'PH', true, NOW(), NOW(), 0),
    ('adr-demo-2', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'Admin User', '09181234567', '12 K-1 Street', 'Mandaluyong', 'Mandaluyong', 'Metro Manila', '1550', 'PH', false, NOW(), NOW(), 0)
ON CONFLICT (_pk_address_id) DO NOTHING;

INSERT INTO orders (
    _pk_order_id,
    status,
    order_number,
    _fk_user_id,
    _fk_shipping_address_id,
    subtotal,
    discount_amount,
    shipping_fee,
    total_amount,
    customer_note,
    placed_at,
    updated_at
)
VALUES
    ('ord-demo-2401', 4, 'ORD-2401', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'adr-demo-1', 5118.00, 0.00, 560.00, 5678.00, 'Priority dispatch', NOW() - INTERVAL '1 day', NOW()),
    ('ord-demo-2402', 2, 'ORD-2402', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'adr-demo-2', 2640.00, 0.00, 300.00, 2940.00, 'Gift wrap requested', NOW() - INTERVAL '2 days', NOW()),
    ('ord-demo-2403', 0, 'ORD-2403', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'adr-demo-1', 7310.00, 0.00, 810.00, 8120.00, 'Streetwear drop', NOW() - INTERVAL '3 days', NOW()),
    ('ord-demo-2404', 4, 'ORD-2404', 'usr6267c02a-69c7-4137-ad34-b5c71e089152', 'adr-demo-2', 3060.00, 0.00, 350.00, 3410.00, 'Urgent delivery', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (_pk_order_id) DO NOTHING;

INSERT INTO dashboard_notifications (order_id, order_number, category, weight, company, arrival_time, route, price, status)
VALUES
    ('ord-demo-2401', 'ORD-2401', 'Streetwear', '1,280 g', 'Taguig', NOW() - INTERVAL '1 day', 'Taguig - Metro Manila', 5678.00, 'Delivered'),
    ('ord-demo-2402', 'ORD-2402', 'Essentials', '920 g', 'Mandaluyong', NOW() - INTERVAL '2 days', 'Mandaluyong - Metro Manila', 2940.00, 'Processing'),
    ('ord-demo-2403', 'ORD-2403', 'Outerwear', '1,760 g', 'Taguig', NOW() - INTERVAL '3 days', 'Taguig - Metro Manila', 8120.00, 'Pending'),
    ('ord-demo-2404', 'ORD-2404', 'Accessories', '640 g', 'Mandaluyong', NOW() - INTERVAL '4 days', 'Mandaluyong - Metro Manila', 3410.00, 'Delivered')
ON CONFLICT DO NOTHING;
