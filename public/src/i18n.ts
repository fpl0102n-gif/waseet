import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      yes: 'Yes',
      no: 'No',
      nav: {
        home: 'Home',
        order: 'Order',
        track: 'Track Order',
        earn: 'Earn Rewards',
        verify: 'Verify',
        about: 'About',
        contact: 'Contact',
        exchange: 'Exchange',
        internationalAgent: 'International Agent',
        agent: {
          requestImport: 'Request Import',
          registerAgent: 'Register as Agent'
        },
        store: 'Store',
        alkhayr_label: 'Al-Khayr',
        waseet: 'Waseet'
      },
      cart: {
        title: 'Your Cart',
        empty: 'Your cart is empty',
        start_shopping: 'Start Shopping',
        no_img: 'No Img',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        shipping_home: 'Shipping (Home)',
        shipping_desk: 'Shipping (Stopdesk)',
        shipping_to: 'Shipping to:',
        change: 'Change',
        select_wilaya: 'Select Wilaya',
        select_address: 'Select Address',
        total: 'Total',
        checkout_details: 'Checkout Details',
        name: 'Full Name *',
        name_placeholder: 'John Doe',
        phone: 'Phone Number *',
        phone_placeholder: '+213...',
        email: 'Email (Optional)',
        email_placeholder: 'john@example.com',
        additional_contact: 'Additional Contact Methods (Optional)',
        whatsapp: 'WhatsApp',
        whatsapp_placeholder: 'WhatsApp Number (+213...)',
        telegram: 'Telegram',
        telegram_placeholder: 'Telegram @username',
        place_order: 'Place Order',
        processing: 'Processing...',
        close: 'Close',
        order_success_title: 'Order Placed Successfully',
        order_success_desc: 'We have received your order.',
        contact_shortly: 'We will contact you shortly to confirm your order.',
        keep_ref: 'Please keep these order numbers for your reference.',
        validation: {
          missing_shipping_title: 'Missing Shipping Info',
          missing_shipping_desc: 'Please provide your shipping address.',
          missing_name_title: 'Missing Name',
          missing_name_desc: 'Please enter your full name.',
          missing_phone_title: 'Missing Phone',
          missing_phone_desc: 'Please enter your mandatory phone number.',
          missing_whatsapp_title: 'Missing WhatsApp',
          missing_whatsapp_desc: 'Please enter your WhatsApp number or uncheck the option.',
          missing_telegram_title: 'Missing Telegram',
          missing_telegram_desc: 'Please enter your Telegram username or uncheck the option.'
        },
        order_failed_title: 'Order Failed',
        order_failed_desc: 'Something went wrong. Please try again.'
      },

      footer: {
        home: 'Home',
        order: 'Order',
        contact: 'Contact',
        rights: 'All rights reserved.',
        services: 'Services',
        support: 'Support',
        connect: 'Connect',
        importRequest: 'Import Request',
        aboutUs: 'About Us',
        verified_badge: 'Human-verified requests • Broker-based service',
        privacy: 'Privacy',
        terms: 'Terms',
        cookies: 'Cookies',
        brandDesc: 'Waseet is a trusted brokerage platform connecting people to logistics, exchange, and verified services.',
        trackOrder: 'Track Order',
        exchange: 'Exchange',
      },
      contact: {
        title: 'Get in Touch',
        subtitle: "Have questions? We're here to help. Reach out through any of these channels.",
        whatsapp_title: 'WhatsApp',
        whatsapp_desc: 'Chat with us on WhatsApp',
        telegram_title: 'Telegram',
        telegram_desc: 'Message us on Telegram',
        email_title: 'Email',
        email_desc: 'Send us an email',
        hours_title: 'Business Hours',
        hours_desc: "We're available during these times",
        days: { monfri: 'Monday - Friday', sat: 'Saturday', sun: 'Sunday' },
        times: { monfri: '9:00 AM - 6:00 PM', sat: '10:00 AM - 4:00 PM', sun: 'Closed' }
      },
      home: {
        hero: {
          title_prefix: 'Trusted Brokerage for',
          title_highlight: 'Logistics & Exchange',
          subtitle: 'Waseet connects you to international markets and currency exchange through a secure, human-verified process. Professional, transparent, and built for Algeria.',
          cta_explore: 'Explore Services',
          cta_track: 'Track Order'
        },
        services: {
          title: 'Our Services',
          subtitle: 'Professional solutions for your international needs.',
          marketplace: {
            title: 'Marketplace',
            desc: 'Access curated products with transparent pricing. Place orders easily and let us handle the logistics to your wilaya.',
            btn: 'Browse Store'
          },
          exchange: {
            title: 'Currency Exchange',
            desc: 'Secure brokerage for currency transactions. We verify every request manually to ensure safety and reliability.',
            btn: 'Exchange Rates'
          },
          import: {
            title: 'Custom Import',
            desc: 'Request specific items from international markets. We review availability and provide a confirmed quote including delivery.',
            btn: 'Request Quote'
          },
          tracking: {
            title: 'Order Tracking',
            desc: 'Real-time status updates for all your transactions. Simply enter your order ID to verify progress.',
            btn: 'Track Status'
          }
        },
        how: {
          title: 'How the Platform Works',
          subtitle: 'A simple, human-verified process for every request.',
          steps: {
            1: { title: 'Submit Request', desc: 'Order, exchange, or import via our forms.' },
            2: { title: 'Team Review', desc: 'We manually check details & availability.' },
            3: { title: 'Confirmation', desc: 'You receive approval before any action.' },
            4: { title: 'Track Progress', desc: 'Follow status updates until completion.' }
          },
          manual_note: 'No automatic execution. Every step is verified by a human.'
        },
        trust: {
          title: 'Built on Process, Not Promises',
          subtitle: 'We prioritize safety, transparency, and clarity over speed.',
          cards: {
            review: { title: 'Human Review', desc: 'Every request is reviewed manually. No blind processing—we confirm details first.' },
            comms: { title: 'Clear Comms', desc: 'We verify prices and timelines with you before acting. You are never left guessing.' },
            broker: { title: 'Broker Role', desc: 'We act as your broker, coordinating and verifying transactions to keep control in your hands.' },
            local: { title: 'Local Reality', desc: 'Built for Algeria. From wilaya-based logistics to manual checks, we know the context.' }
          }
        },
        who: {
          title: 'Who Uses Waseet?',
          shoppers: { title: 'International Shoppers', desc: 'Individuals who want to buy from abroad but need a trusted intermediary.' },
          exchangers: { title: 'Currency Exchangers', desc: 'People needing secure, coordinated exchange services without the risk.' },
          verification: { title: 'Verification Seekers', desc: 'Users who prefer human confirmation over blind automated systems.' }
        },
        transparency: {
          title: 'What Waseet Is Not',
          items: {
            1: 'Waseet is <strong>not a bank</strong> and does not hold funds like a wallet.',
            2: 'Waseet does <strong>not execute automatic payments</strong> without review.',
            3: 'Waseet does <strong>not guarantee availability</strong> instantly; confirmation is required.'
          }
        },
        ready: {
          title: 'Ready to Start?',
          explore: 'Explore Services',
          support: 'Contact Support'
        }
      },
      about: {
        hero: {
          title: 'About Waseet',
          subtitle: 'Your trusted service broker bridging the gap between local needs and international opportunities.'
        },
        what: {
          title: 'What is Waseet?',
          desc1: 'Waseet is a service brokerage platform designed to simplify complex transactions for Algerian users. We act as a secure intermediary, connecting you with products, currency exchange opportunities, and international markets.',
          desc2: 'We operate on a <strong>"human-in-the-loop"</strong> model. This means every request is personally reviewed and processed by our team, ensuring safety and accuracy rather than relying on blind automation.',
          cards: {
            mediated: 'Mediated Service',
            secure: 'Secure Process'
          }
        },
        services: {
          title: 'What We Do',
          subtitle: 'Our core services simplify your access to the digital economy.',
          cards: {
            store: { title: 'Store & Ordering', desc: 'Browse our curated store for high-demand items. You can place orders without creating an account. Each order is manually reviewed to confirm availability and shipping details based on your Wilaya before processing.' },
            exchange: { title: 'Currency Exchange', desc: 'Submit requests to buy or sell standard currencies. Our rates are indicative and set by our administrators. We process these requests manually to ensure a safe exchange environment for all parties.' },
            import: { title: 'Import & Logistics', desc: 'Access international markets through our custom import service (Coming Soon). We also collaborate with verified logistics partners to handle shipping. All agent partnerships are manually vetted.' }
          }
        },
        how: {
          title: 'How It Works',
          steps: {
            1: { title: 'Request', desc: 'You submit your order, exchange, or import request via our simple forms.' },
            2: { title: 'Review', desc: 'Our team personally checks details, stock, and rates for accuracy.' },
            3: { title: 'Contact', desc: 'We reach out to you via phone or WhatsApp to confirm and finalize.' },
            4: { title: 'Update', desc: 'Track your status anytime using your Order ID on our tracking page.' }
          }
        },
        why: {
          title: 'Why Choose Waseet?',
          items: {
            adapted: { title: 'Adapted to Algeria', desc: 'Built specifically for the local context and challenges.' },
            human: { title: 'Human Verification', desc: 'We prioritize safety over speed. Every transaction is monitored.' },
            centralized: { title: 'Centralized Service', desc: 'Multiple services (Shopping, Exchange, Import) in one trustworthy place.' }
          }
        },
        notice: {
          title: 'Important Transparency Notice',
          desc: 'To ensure complete trust and transparency with our users, we want to be clear about what we are NOT:',
          items: {
            1: 'We are <strong>NOT a bank</strong> or official financial institution.',
            2: 'We do <strong>NOT process payments automatically</strong>. All funds are handled securely through verified manual channels.',
            3: 'Placement of a request acts as a booking, not an instant guarantee. Confirmation follows shortly after review.'
          }
        },
        footer: {
          title: 'Questions?',
          desc: 'Our team is here to help you navigate our services.',
          support: 'Support available via WhatsApp & Email'
        }
      },
      terms: {
        title: 'Terms & Conditions',
        subtitle: 'Welcome to Waseet. Here are the rules regulating our connection and brokerage service.',
        acceptance: { title: '1. Acceptance of Terms', desc: 'By using the Waseet platform (website and associated services), you fully and unreservedly accept these conditions. If you do not agree, we invite you not to use our services.' },
        description: { title: '2. Description of Service', desc: 'Waseet is a <strong>brokerage and coordination platform</strong>. Our role is to connect needs (shopping, logistics, humanitarian aid) with solutions (sellers, delivery drivers, donors, volunteers).', note: 'Important note: Waseet facilitates connection but is not the direct supplier of medical products, nor a carrier, nor a bank.' },
        responsibilities: { title: '3. User Responsibilities', desc: 'As a user, you agree to:', items: { 1: 'Provide accurate and sincere information (especially for humanitarian requests).', 2: 'Not create false requests or mislead other users.', 3: 'Respect other community members (donors, drivers, admins).', 4: 'Not use the platform for illegal activities.' }, warning: 'Any abusive behavior may result in immediate suspension of your access.' },
        humanitarian: { title: '4. Humanitarian & Health Disclaimer', items: { alkhayr: '<strong>Alkhayr (Medicines):</strong> We verify requests, but we do not guarantee a donor will be found. Waseet does not replace a pharmacy or medical advice.', blood: '<strong>Blood Donation:</strong> Coordination via Waseet is voluntary aid to save time. In case of vital emergency, always contact hospitals or civil protection directly.', transport: '<strong>Urgent Transport:</strong> Volunteers coordinated by Waseet are not professional ambulance drivers.' } },
        brokerage: { title: '5. Brokerage & Exchange', items: { 1: 'Waseet acts as a broker. We do not hold funds like a bank.', 2: 'Displayed exchange rates are indicative and may vary according to the market.', 3: 'Waseet is not responsible for delays caused by third parties (banks, payment services, customs).' } },
        intermediary: { title: '6. Limits of Intermediation', desc: 'We do our best to verify the seriousness of participants, but we cannot guarantee the successful completion of every transaction or promise of donation made by a third party. Agreements concluded between users outside Waseet supervision are your own responsibility.' },
        moderation: { title: '7. Moderation & Admin Rights', desc: 'For everyone\'s safety, Waseet administrators reserve the right to:', items: { 1: 'Refuse or delete any request deemed suspicious, incomplete, or inappropriate.', 2: 'Modify public content to protect sensitive data (masking names, etc.).', 3: 'Ban users not respecting the rules.' } },
        liability: { title: '8. Limitation of Liability', desc: 'Waseet provides its platform "as is". We are not responsible for indirect damages, loss of opportunity, or disappointments related to an unsatisfied request for help. Use of the service is at your own risk, within the limits of the applicable legal framework.' },
        misc: { title: '9. Miscellaneous', items: { privacy: '<strong>Privacy:</strong> Your data is processed according to our <a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>.', changes: '<strong>Changes:</strong> These conditions may be updated. Continued use of the site constitutes acceptance of the new rules.', legal: '<strong>Legal Context:</strong> This platform operates primarily in Algeria. Disputes will be treated with common sense and, if necessary, according to local competent jurisdictions.' } },
        footer: { question: 'Questions about these terms?', contact: 'Contact Us' }
      },
      privacy: {
        title: 'Privacy Policy',
        subtitle: 'At Waseet, we take your privacy seriously. This policy explains simply and honestly how we treat your information.',
        intro: { title: '1. Introduction', desc: 'Waseet is a brokerage platform facilitating shopping, logistics, and humanitarian aid in Algeria. Our role is to connect needs to solutions. To do this, we must collect and treat certain information, always exclusively for the purpose of rendering the service for which you solicited us.' },
        collect: { title: '2. Information We Collect', section_a: 'a) What you provide', items_a: { 1: 'Name and Surname', 2: 'Phone number (to contact you)', 3: 'Email address (optional or for confirmation)', 4: 'Location (Wilaya / Commune) for delivery', 5: 'Details of your requests (prescriptions, products, blood type)', 6: 'Social accounts (WhatsApp/Telegram) if you choose to link them' }, section_b: 'b) Automatic Collection', items_b: { 1: 'Device type and browser (to optimize display)', 2: 'Anonymous visit statistics (to improve the site)' } },
        use: { title: '3. How We Use Your Data', desc: 'We use your data only to:', items: { 1: 'Process and execute your orders or aid requests.', 2: 'Coordinate logistics (delivery, transport).', 3: 'Contact you in case of problems or to confirm information.', 4: 'Manage emergencies (Alkhayr or Blood Donation cases).', 5: 'Improve our internal services.' }, note: '✋ We NEVER sell your personal data to third parties.' },
        visibility: { title: '4. Visibility & Human Review', desc: 'This is an important point of our platform: <strong>every sensitive request is reviewed by a human administrator</strong> before being published (especially for Alkhayr).', items: { 1: 'We do not automatically publish everything you send.', 2: 'Sensitive information (like your full name on a public request) is masked or replaced by initials.', 3: 'Only Waseet administrators have access to all your raw data.' } },
        sharing: { title: '5. Data Sharing', desc: 'Your data stays with Waseet. It is only shared in strictly operational cases:', items: { 1: 'With a delivery driver to route your package.', 2: 'With a donor who agrees to help you (after your agreement).', 3: 'With competent authorities if the law imperatively requires it.' }, note: 'We act as a security filter between parties to protect your privacy.' },
        cookies: { title: '6. Cookies, Security & Duration', items: { cookies: '<strong>Cookies:</strong> We use simple cookies for the site to function (e.g., keeping your cart active). We do not use cookies to track you on other sites.', security: '<strong>Security:</strong> Your data is stored on secure servers. Access is restricted to our internal team. Although "zero risk" does not exist on the Internet, we take all reasonable measures to protect your information.', duration: '<strong>Duration:</strong> We do not keep your data indefinitely. Closed or long-inactive requests may be deleted from our databases.' } },
        rights: { title: '7. Your Rights', desc: 'You remain the owner of your data. You have the right to:', items: { 1: 'Ask to see what information we have on you.', 2: 'Ask for correction of an error.', 3: 'Ask for complete deletion of your data (unless a transaction is in progress).' } },
        legal: { title: '8. Legal Position & Updates', items: { intermediary: '<strong>Intermediary:</strong> Waseet is a connection platform. We coordinate aid and services, but we are not a bank, nor a hospital.', children: '<strong>Children:</strong> Our service is not intended for children. We do not intentionally collect data on minors without parental consent.', updates: '<strong>Updates:</strong> This policy may evolve. Any modification will be published right here.' } },
        footer: { question: 'Questions about your privacy?', contact: 'Contact Us' }
      },
      order: {
        header: {
          title: 'New Order',
          subtitle: 'Fast. Simple. Worldwide.'
        },
        product: {
          title: 'Product Information',
          name: 'Product Name',
          name_ph: 'e.g. iPhone 15 Pro Max',
          url: 'Product URL *',
          url_ph: 'https://amazon.com/product',
          price: 'Product Price *',
          shipping: 'Shipping ($)'
        },
        personal: {
          title: 'Your Information',
          name: 'Full Name *',
          name_ph: 'John Doe',
          contact_method: 'Contact Method *',
          whatsapp: 'WhatsApp',
          telegram: 'Telegram',
          contact_ph_whatsapp: '+213550123456',
          contact_ph_telegram: '@username'
        },
        optional: {
          referral: 'Referral Code (Optional)',
          referral_ph: 'ABCD1234',
          notes: 'Notes',
          notes_ph: 'Color, size, special instructions...'
        },
        actions: {
          processing: 'Processing...',
          place: 'Place Order',
          add_to_cart: 'Add to Cart'
        },
        summary: {
          title: 'Order Summary',
          product: 'Product',
          shipping: 'Shipping',
          total: 'Total',
          usd_total: 'Total (USD)',
          dzd: 'Algerian Dinar'
        },
        benefits: {
          secure_title: 'Secure Payment',
          secure_desc: 'Your data is encrypted',
          fast_title: 'Fast Processing',
          fast_desc: 'Orders confirmed within 24h',
          track_title: 'Real-time Tracking',
          track_desc: 'Follow your order every step'
        },
        validation: {
          error: 'Error',
          url_required: 'Product URL is required',
          url_invalid: 'Please enter a valid URL starting with http:// or https://',
          price_required: 'Please enter a valid product price',
          name_required: 'Name is required',
          contact_required: 'Contact information is required',
          phone_invalid: 'The number must be in the format +213 5/6/7 followed by 8 digits (e.g., +213550123456)',
          self_referral: 'You cannot use your own referral code.',
          invalid_referral: 'Referral code not found. Please check the code and try again.'
        },
        success: {
          title: 'Success!',
          desc: 'Your order has been submitted successfully'
        },
        toast: {
          added: 'Added to cart',
          added_desc: 'Product added to your cart'
        },
        error: {
          title: 'Error',
          generic: 'Failed to submit order. Please try again.'
        }
      },
      tracking: {
        title: 'Track Your Order',
        subtitle: 'Enter your order ID to check the status of your order',
        cardTitle: 'Order Tracking',
        cardDesc: 'You can find your order ID in the confirmation page or email',
        orderId: 'Order ID',
        orderIdPh: 'Enter your order ID (e.g., 12)',
        trackBtn: 'Track Order',
        searching: 'Searching...',
        toast: {
          error: 'Error',
          id_required: 'Please enter an order ID',
          not_found_title: 'Not Found',
          not_found_desc: 'No order found with this ID',
          fetch_error: 'Failed to fetch order details'
        },
        result: {
          order: 'Order #{{id}}',
          customerName: 'Customer Name',
          contact: 'Contact',
          productUrl: 'Product URL',
          viewProduct: 'View Product',
          totalAmount: 'Total Amount',
          orderDate: 'Order Date',
          notes: 'Notes'
        },
        status: { new: 'New', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
      },
      referral: {
        headerTitle: 'Earn Rewards with Referrals',
        headerDesc: 'Share your code and earn 1000 DA for every $200 of purchases made with your code',
        genTitle: 'Generate Your Referral Code',
        genDesc: 'Enter your contact information to create your unique referral code',
        contactMethod: 'Contact Method',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        labels: { whatsapp: 'WhatsApp Number', telegram: 'Telegram Username' },
        placeholders: { whatsapp: '+213550123456', telegram: '@yourusername' },
        actions: { generate: 'Generate My Code', generating: 'Generating...', verify: 'Verify My Earnings', checking: 'Checking...' },
        toast: {
          error: 'Error',
          contact_required: 'Please enter your contact information',
          phone_invalid: 'Format must be +2135/6/7 + 8 digits (e.g., +213550123456)',
          existing_title: 'Existing code found!',
          existing_desc: 'Here is your existing referral code',
          success_title: 'Success!',
          success_desc: 'Your referral code has been generated',
          check_none_title: 'No code found',
          check_none_desc: "No referral code exists for this contact",
          check_found_title: 'Stats found!',
          check_found_desc: 'Here are your referral statistics',
          copied_title: 'Copied!',
          copied_desc: 'Referral code copied to clipboard'
        },
        stats: {
          your_code: 'Your Referral Code',
          total_collected: 'Total collected',
          rewards: 'Rewards',
          total_earned: 'Total earned',
          milestone_prefix: 'Only',
          milestone_suffix: 'more to earn',
          milestone_reward: '1000 DA'
        },
        withdraw: {
          button: 'Request Withdrawal',
          available_balance: 'Available Balance',
          ready: 'Ready to Withdraw',
          pending_approval: 'Pending Approval',
          pending_request: 'Pending Request',
          request_submitted: 'Request Submitted',
          success_title: 'Request Sent!',
          success_desc: 'Your withdrawal request will be processed shortly'
        },
        generateAnother: 'Generate another code',
        contactLabel: 'Contact: {{type}} - {{value}}',
        howItWorks: {
          title: 'How it works:',
          step1: 'Share your code with friends and family',
          step2: 'They enter your code when making a purchase',
          step3: 'Every $200 in purchases = 1000 DA for you',
          step4: 'No limit! Keep earning as your referrals shop',
          example: 'Example: If purchases with your code reach $600 total, you\'ll earn 3000 DA (1000 DA × 3)'
        },
        self_referral_note: 'You cannot earn rewards by using your own referral code.'
      },
      verify: {
        title: 'Verify My Purchases',
        subtitle: 'Enter your WhatsApp or Telegram to see your orders',
        cardTitle: 'Find Your Orders',
        cardDesc: "We'll search orders by your contact information",
        contactMethod: 'Contact Method',
        labels: { whatsapp: 'WhatsApp', telegram: 'Telegram', number: 'WhatsApp Number', username: 'Telegram Username' },
        placeholders: { whatsapp: '+213550123456', telegram: '@yourusername' },
        actions: { verify: 'Verify My Purchases', checking: 'Checking...' },
        toast: {
          error: 'Error',
          contact_required: 'Please enter your contact',
          phone_invalid: 'Format must be +2135/6/7 + 8 digits (e.g., +213550123456)',
          no_purchases_title: 'No purchases found',
          no_purchases_desc: "We couldn't find orders for this contact",
          fetch_error_title: 'Error',
          fetch_error_desc: 'Failed to fetch purchases'
        },
        results: { title: 'Your Orders', found: '{{count}} found', order: 'Order #{{id}}', productLink: 'Product Link' }
      },
      success: {
        title: 'Order Submitted Successfully!',
        processing: 'Your order has been received and is being processed.',
        contactSoon: "We'll contact you soon via {{type}} at {{value}}",
        orderId: 'Order ID',
        customerName: 'Customer Name',
        totalAmount: 'Total Amount',
        shareWhatsapp: 'Share on WhatsApp',
        returnHome: 'Return to Home',
        questions: 'Questions? Visit our ',
        contactPage: 'Contact Page'
      },
      notFound: {
        oops: 'Oops! Page not found',
        returnHome: 'Return to Home'
      },

      product_details: {
        notFound: {
          title: 'Product Not Found',
          desc: 'The product you are looking for does not exist or has been removed.'
        },
        backToStore: 'Back to Store',
        back: 'Back',
        inStock: 'In Stock',
        addToCart: 'Add to Cart',
        freeShipping: 'Free shipping on orders over $100',
        securePayment: 'Secure payment',
        noDescription: 'No description available.'
      },

      admin_orders: {
        title: 'Order Management',
        subtitle: 'View and manage all customer orders in one place',
        listTitle: 'All Orders',
        searchPlaceholder: 'Search orders, customers...',
        filterType: {
          all: 'All Types',
          store: 'Store Orders',
          custom: 'Custom Requests'
        },
        status: {
          all: 'All Statuses',
          new: 'New',
          processing: 'Processing',
          done: 'Completed',
          cancelled: 'Cancelled'
        },
        table: {
          id: 'Order ID',
          type: 'Type',
          product: 'Product',
          customer: 'Customer',
          contact: 'Contact',
          total: 'Total',
          status: 'Status',
          date: 'Date',
          actions: 'Actions'
        },
        badges: {
          store: 'Store',
          custom: 'Custom'
        },
        noOrders: 'No orders found fitting your criteria.',
        externalLink: 'External Link',
        viewDetails: 'View Details'
      },

      admin_store: {
        management: {
          title: 'Store Management',
          desc: 'Manage store categories, products, and product types',
          tabs: {
            categories: 'Store Categories',
            products: 'Products',
            types: 'Product Types'
          }
        },
        categories: {
          title: 'Store Categories',
          add: 'Add Category',
          edit: 'Edit Category',
          manageDesc: 'Manage store category information and settings.',
          table: {
            name: 'Name',
            badge: 'Badge',
            slug: 'Slug',
            status: 'Status',
            order: 'Order',
            actions: 'Actions',
            active: 'Active',
            inactive: 'Inactive'
          },
          form: {
            name: 'Name *',
            slug: 'Slug *',
            badgeLabel: 'Badge Label *',
            badgeColor: 'Badge Color'
          },
          messages: {
            validation: 'Please fill in all required fields.',
            updated: 'Store category updated.',
            created: 'Store category created.',
            deleted: 'Category deleted.',
            confirmDelete: 'Are you sure you want to delete this category?'
          }
        },
        products: {
          title: 'Products',
          add: 'Add Product',
          edit: 'Edit Product',
          manageDesc: 'Manage product information and images.',
          noCategories: {
            title: 'No Store Categories',
            desc: 'Please create a store category first before adding products.',
            boxTitle: 'No store categories found.',
            boxDesc: 'Please create a store category first in the "Categories" tab before adding products.'
          },
          form: {
            category: 'Store Category *',
            type: 'Product Type',
            name: 'Name *',
            slug: 'Slug *',
            price: 'Price *',
            stock: 'Stock Quantity',
            desc: 'Description',
            status: 'Status',
            images: 'Images',
            placeholders: {
              selectCategory: 'Select category',
              selectType: 'Select type (optional)',
              none: 'None',
              unlimited: 'Leave empty for unlimited'
            }
          },
          table: {
            category: 'Category',
            price: 'Price',
            stock: 'Stock',
            status: 'Status',
            actions: 'Actions',
            inStock: '{{count}} in stock',
            outOfStock: 'Out of Stock',
            unlimited: 'Unlimited'
          },
          messages: {
            updated: 'Product updated.',
            created: 'Product created.',
            deleted: 'Product deleted.',
            imagesUploaded: 'Images uploaded.',
            confirmDelete: 'Are you sure you want to delete this product?'
          }
        },
        types: {
          title: 'Product Types',
          add: 'Add Product Type',
          edit: 'Edit Product Type',
          manageDesc: 'Manage product types for store categories.',
          table: {
            name: 'Name',
            category: 'Category',
            slug: 'Slug',
            status: 'Status',
            order: 'Order',
            actions: 'Actions',
            active: 'Active',
            inactive: 'Inactive'
          },
          form: {
            category: 'Store Category *',
            name: 'Name *',
            slug: 'Slug *',
            desc: 'Description',
            order: 'Display Order',
            active: 'Active',
            placeholders: {
              selectCategory: 'Select category',
              name: 'Diagnostic Equipment',
              slug: 'diagnostic',
              desc: 'Product type description...'
            }
          },
          messages: {
            validation: 'Please fill in all required fields.',
            updated: 'Product type updated.',
            created: 'Product type created.',
            deleted: 'Product type deleted.',
            confirmDelete: 'Are you sure you want to delete this product type?'
          }
        },
        suggestions: {
          title: 'Product Suggestions',
          subtitle: 'Review products suggested by users.',
          listTitle: 'Suggestions List',
          search: {
            placeholder: 'Search product or user...',
            filter: 'Filter by Status'
          },
          status: {
            all: 'All Statuses',
            pending: 'Pending',
            reviewed: 'Reviewed',
            accepted: 'Accepted',
            rejected: 'Rejected'
          },
          table: {
            product: 'Product Name',
            price: 'Price',
            user: 'User',
            status: 'Status',
            date: 'Date',
            actions: 'Actions'
          },
          messages: {
            empty: 'No suggestions found.',
            errorFetch: 'Failed to fetch suggestions.'
          },
          actions: {
            review: 'Review'
          }
        },
      },

      alkhayr: {
        title: 'Al-Khayr - Humanitarian Medical Assistance',
        subtitle: 'Medical help with zero commission - 100% humanitarian',
        legacy_mode_warning: '⚠️ Legacy Mode: This is the old design.',
        requests: {
          title: 'Humanitarian Requests',
          subtitle: 'Accepted requests with classification and funding info',
          classification: 'Classification',
          amount: 'Amount',
          currency: 'Currency',
          severe: 'Severe',
          medium: 'Medium',
          normal: 'Normal',
          statusAccepted: 'Accepted',
          statusPending: 'Pending',
          statusRejected: 'Rejected',
          empty: 'No accepted requests yet',
          filterAll: 'All',
          filterSevere: 'Severe',
          filterMedium: 'Medium',
          filterNormal: 'Normal'
        },
        nav: {
          local: 'Local Medicine Request',
          foreign: 'Medicine From Abroad',
          diaspora: 'Volunteer Registration',
          myRequests: 'My Requests',
          zeroCommission: 'Zero-Commission Policy',
          faq: 'FAQ'
        },
        local: {
          title: 'Request Medicine Available Locally',
          subtitle: 'Get help obtaining medicine available in the country',
          form: {
            fullName: 'Full Name',
            city: 'City / Address',
            contact: 'Contact Information',
            contactPlaceholder: 'WhatsApp or Telegram',
            medicineName: 'Medicine or Treatment Name',
            medicineNamePlaceholder: 'e.g., Paracetamol 500mg',
            prescription: 'Upload Prescription (optional)',
            financialAbility: 'Financial Ability',
            canPay: 'Yes, I can pay',
            cannotPay: 'No, I cannot',
            canPayPartially: 'Partially',
            affordAmount: 'Amount you can afford',
            needDelivery: 'Need delivery?',
            paidDelivery: 'Paid',
            freeDelivery: 'Free',
            noDelivery: 'No',
            urgency: 'Priority Level',
            urgent: 'Urgent',
            normal: 'Normal',
            notes: 'Additional Notes',
            submit: 'Submit Request',
            submitting: 'Submitting...'
          },
          success: {
            title: 'Request Submitted Successfully',
            desc: 'We will review your request and contact you soon'
          }
        },
        foreign: {
          title: 'Request Medicine From Abroad',
          subtitle: 'Get help purchasing medicine not available locally',
          form: {
            fullName: 'Full Name',
            city: 'City',
            contact: 'Contact Information',
            medicineName: 'Medicine Details',
            medicineNamePlaceholder: 'Name, dosage, quantity',
            prescription: 'Prescription / Medical Report',
            expectedCountry: 'Expected Country of Origin',
            expectedCountryPlaceholder: 'e.g., France, Germany, UAE',
            needType: 'What you need',
            purchaseAndShipping: 'Purchase + Shipping',
            shippingOnly: 'Shipping Only',
            financialAbility: 'Financial Ability',
            canPay: 'Yes',
            cannotPay: 'No',
            canPayPartially: 'Partially',
            budget: 'Approximate Budget',
            urgency: 'Priority Level',
            urgent: 'Urgent',
            normal: 'Normal',
            notes: 'Additional Notes',
            submit: 'Submit Request',
            submitting: 'Submitting...'
          },
          success: {
            title: 'Request Submitted Successfully',
            desc: 'We will find a volunteer to help you'
          }
        },
        diaspora: {
          title: 'Volunteer Registration (Diaspora)',
          subtitle: 'Help patients from your current country',
          form: {
            personalInfo: 'Personal Information',
            fullName: 'Full Name',
            country: 'Current Country',
            city: 'City',
            contact: 'Contact Information',
            canOffer: 'What can you offer? (select multiple)',
            sendMedicine: 'Send medicine',
            buyMedicine: 'Buy medicine',
            shipParcels: 'Ship parcels',
            financialSupport: 'Financial support',
            coordination: 'Coordination',
            financialAbility: 'Financial Ability',
            canFullyCover: 'Yes - can fully cover',
            cannotCover: 'No - cannot',
            canPartiallyCover: 'Partially - can cover part',
            maxAmount: 'Maximum Amount',
            extraNotes: 'Extra Notes',
            extraNotesPlaceholder: 'Pharmacies you know, shipping contacts...',
            notifications: 'Notification Preferences',
            urgentCases: 'Urgent cases',
            fundingNeeded: 'Cases needing funding',
            importRequests: 'Import medicine requests',
            agree: 'I agree to terms (privacy + legality + zero commission)',
            submit: 'Register as Volunteer',
            submitting: 'Registering...'
          },
          success: {
            title: 'Thank you for registering!',
            desc: 'We will review your application and contact you soon'
          }
        },
        myRequests: {
          title: 'My Medical Requests',
          subtitle: 'Track the status of your medical requests',
          enterContact: 'Enter your contact information',
          view: 'View Requests',
          noRequests: 'No requests found',
          type: 'Type',
          status: 'Status',
          date: 'Date',
          statusPending: 'Pending',
          statusReviewing: 'Reviewing',
          statusMatched: 'Matched',
          statusInProgress: 'In Progress',
          statusCompleted: 'Completed',
          statusCancelled: 'Cancelled',
          typeLocal: 'Local',
          typeForeign: 'From Abroad'
        },
        zeroCommission: {
          title: 'Zero-Commission Policy',
          subtitle: 'Our commitment to 100% humanitarian assistance',
          principle1Title: 'No Commissions Whatsoever',
          principle1Desc: 'The platform takes absolutely no commission from humanitarian requests',
          principle2Title: 'All Requests Are Free',
          principle2Desc: 'All medical assistance requests are completely free',
          principle3Title: 'Full Transparency',
          principle3Desc: 'We protect patient privacy and verify all requests',
          principle4Title: 'Legal & Responsible',
          principle4Desc: 'We follow all legal rules for importing medicine',
          commercial: 'Note: Any paid service (e.g., commercial delivery) is separate and not part of Al-Khayr'
        },
        faq: {
          title: 'FAQ - Al-Khayr',
          subtitle: 'How the medical assistance system works',
          q1: 'What is Al-Khayr?',
          a1: 'Al-Khayr is a humanitarian medical assistance system with zero commission. We connect patients with volunteers to facilitate access to medicine.',
          q2: 'Are there any fees?',
          a2: 'No, all humanitarian medical requests are completely free. We take no commission.',
          q3: 'How can I request medicine?',
          a3: 'Choose between "Local Medicine Request" if available in the country, or "Medicine From Abroad" if it needs importing.',
          q4: 'How can I help as a volunteer?',
          a4: 'Register on the "Volunteer Registration" page and specify what help you can offer.',
          q5: 'Is my information safe?',
          a5: 'Yes, we protect all patient privacy. Information is only shared with approved volunteers.',
          q6: 'What about medicine import laws?',
          a6: 'We verify all requests and follow local and international laws for medicine import.'
        },
        admin: {
          title: 'Al-Khayr Administration',
          subtitle: 'Manage requests, matches, and volunteers'
        }
      },
      admin: {
        metrics: {
          pendingOrders: 'Pending Orders',
          pendingDesc: 'Awaiting processing',
          shipped: 'Shipped',
          shippedDesc: 'On their way',
          disputes: 'Disputes',
          disputesDesc: 'Needs attention',
          newAgents: 'New Agents',
          newAgentsDesc: 'In last 7 days'
        },
        actions: {
          title: 'Quick Actions',
          refresh: 'Refresh',
          export: 'Export Data',
          orders: 'Manage Orders',
          agents: 'Review Agents',
          referrals: 'Referral Codes',
          settings: 'Settings',
          imports: 'Import Requests',
          exchange: 'Exchange Rates',
          desc: 'Access tools and management interfaces.'
        }
      },
      exchange: {
        title: 'Secure Exchange Broker',
        subtitle: 'Fast, secure, and mediated P2P currency exchange. We ensure every transaction is safe.',
        have: {
          step: '1',
          title: 'I Have',
          currency: 'Currency to Sell',
          payment: 'Payment Method (Deposit)',
          amount: 'Amount'
        },
        want: {
          step: '2',
          title: 'I Want',
          currency: 'Currency to Buy',
          payment: 'Payment Method (Receive)',
          total: 'Estimated Total'
        },
        location: {
          wilaya: 'Wilaya (Location)',
          neededBy: 'When do you need this?'
        },
        private: {
          title: 'Private Contact Details',
          subtitle: '(Visible to Admin Only)',
          email: 'Email',
          phone: 'Phone Number',
          whatsapp: 'WhatsApp (Optional)',
          telegram: 'Telegram (Optional)'
        },
        form: {
          terms_label: 'I accept the terms of service. I understand that Waseet acts as a broker and this request is subject to manual review.',
          submit_btn: 'Submit Secure Request',
          submitting: 'Submitting...',
          placeholder: {
            select_currency: 'Select Currency',
            select_method: 'Select Method',
            any_method: 'Any Method',
            select_wilaya: 'Select Wilaya',
            amount: '0.00'
          }
        },
        success: {
          title: 'Request Submitted',
          desc: 'We have received your secure exchange request.',
          id_prefix: 'ID: #'
        },
        validation: {
          terms: 'Please accept terms',
          required: 'Please fill all required fields',
          amount: 'Please enter a valid amount',
          date: 'Please select a date',
          email: 'Email is required',
          phone: 'Phone number is required',
          submit_error: 'Failed to submit request'
        }
      },
      exchange_sidebar: {
        howTitle: 'How it works',
        step1: 'Choose the type (Buy / Sell).',
        step2: 'Select currencies and enter the amount.',
        step3: 'Enter your payment methods.',
        step4: 'Fill in your contact details and attach files if needed.',
        step5: 'Accept the terms then submit.',
        securityTitle: 'Security & Tips',
        securityBody: 'We manually review each request. Never share passwords or sensitive codes. Verification may take up to 24h.'
      },
      alkhayr_public: {
        tabs: {
          submit: 'Submit Request',
          search: 'Search',
          donate: 'Donate',
          profile: 'Profile'
        },

        filter: {
          title: 'Search for Help',
          type: 'Type',
          all: 'All',
          local: 'Local',
          foreign: 'Foreign',
          wilaya: 'Wilaya',
          search: 'Search',
          placeholder: 'Title, summary...',
          reset: 'Reset',
          results: 'results'
        },
        empty: {
          title: 'No requests found',
          desc: 'Try changing your search criteria.'
        },
        card: {
          urgent: 'Urgent',
          local: 'Local',
          foreign: 'Foreign',
          view: 'View Request'
        },
        details: {
          urgent: 'URGENT',
          relative_time: {
            today: 'Today',
            yesterday: 'Yesterday',
            days_ago: '{{days}} days ago'
          },
          no_description: 'No details provided.',
          photos_title: 'Additional Photos',
          contact_button: 'Contact Us to Help',
          ref: 'Request Reference',
          managed_by: 'Managed by Waseet',
          story: 'The Story',
          beneficiary: 'Beneficiary',
          anonymous: 'Anonymous',
          note_title: 'Important Note',
          donate_now: 'Donate Now',
          promo_badge: '❤️ Donate, Save a Life',
          years: 'Years'
        },

        hero: {
          badge: 'Medical Solidarity',
          title: 'Your Health,',
          titleHighlight: 'Our Priority',
          desc: 'A solidarity platform to facilitate access to medicines and connect those in need with those who can help.',
          badges: {
            volunteer: 'Volunteer Help',
            impact: 'Lasting Impact'
          }
        },
        submit: {
          title: 'Request Help',
          desc: 'Fill out this confidential form. Your personal data will not be displayed publicly.',
          success: {
            title: 'Request Saved!',
            desc: 'It will be reviewed by our team. Only validated information will be made public.',
            btn_new: 'Submit New Request'
          },
          tabs: {
            local: 'Local (Algeria)',
            foreign: 'Foreign'
          },
          sections: {
            medication: 'Medication Information',
            requester: 'Requester & Contact',
            location: 'Location',
            financial: 'Financial Capacity (Private)',
            logistics: 'Logistics & Priority'
          },
          form: {
            medName: 'Medication Name *',
            images: 'Photo(s) (optional)',
            imagesHelp: 'You can select multiple images.',
            prescription: 'Prescription (Required for foreign)',
            prescriptionHelp: 'If the prescription has multiple pages, select all of them.',
            desc: 'Description / Details',
            descPlaceholder: 'Describe your need...',
            requesterName: 'Full Name *',
            requesterPlaceholder: 'Will only be displayed as initials (e.g. Mr. B.)',
            phone: 'Phone Number *',
            phonePlaceholder: 'Reachable number',
            otherContacts: 'Other contacts (Optional, visible to admin)',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            wilaya: 'Wilaya *',
            country: 'Target Country *',
            countryPlaceholder: 'Ex: France, Turkey...',
            city: 'City / Municipality *',
            financialOptions: {
              full: 'I can cover all costs',
              partial: 'I can cover part',
              none: 'I cannot cover anything',
              delivery: 'I have the product, just want delivery'
            },
            amount: 'Approximate Amount (DZD)',
            delivery: 'Do you need delivery?',
            priority: {
              label: 'Perceived Priority Level',
              normal: 'Normal',
              important: 'Important',
              urgent: 'Urgent',
              help: 'Indication for admin. Final priority will be determined after review.'
            },
            urgent_checkbox: {
              label: 'Vital Emergency (Life Threatening)',
              desc: 'Check this box ONLY if the patient\'s life is in immediate danger.'
            },
            confirm: 'I confirm that the information provided is accurate and that this request is authentic. I understand that this information will be verified by the team before publication.',
            submitBtn: 'Submit Request',
            submitting: 'Sending...'
          },
          errors: {
            required: 'Please fill in all required fields.',
            wilaya: 'Wilaya is required for local request.',
            country: 'Country is required for foreign request.',
            confirm: 'Please confirm the accuracy of the information.',
            submit: 'An error occurred while sending.'
          },
          toast: {
            success: {
              title: 'Request sent!',
              desc: 'Your request has been submitted for review.'
            }
          }
        },
        donations: {
          title: 'Material Donations Space',
          subtitle: 'Share medicines, medical equipment and material aid with those in need.',
          view_items: 'View Items',
          propose_item: 'Offer an Item',
          available_items: 'Available Items',
          empty: {
            title: 'No items available yet',
            desc: 'Check back later or offer a donation yourself!'
          },
          card: {
            medicine: 'Medicine',
            equipment: 'Equipment',
            other: 'Other',
            new: 'New',
            used_good: 'Good Cond.',
            used_fair: 'Fair Cond.',
            qty: 'Qty',
            view_details: 'View Details',
            contact: 'Contact',
            contact_collect: 'Contact to Collect',
            details_title: 'Donation Details',
            added_on: 'Added on',
            description_title: 'Description',
            no_description: 'Description available upon request.',
            no_images: 'No images available'
          },
          form: {
            title: 'Offer an Item',
            donor_info: 'Your Contact Info (Private - Admin Only)',
            name: 'Full Name *',
            phone: 'Phone Number *',
            has_whatsapp: 'I have WhatsApp',
            has_telegram: 'I have Telegram',
            item_details: 'Item Details',
            item_name: 'Item Name *',
            category: 'Category *',
            condition: 'Condition *',
            location: 'Location (Wilaya or Country) *',
            description: 'Description (Private - Admin will write public version)',
            photos: 'Photos * (At least 1)',
            consent: 'I confirm this item is available for donation and agree to share item details (excluding my personal contact) on the platform.',
            submit: 'Submit Offer',
            success_title: 'Offer Submitted!',
            success_desc: 'Your offer has been sent for validation. Thank you for your generosity!',
            uploading: 'Uploading...'
          }
        },
        profile: {
          title: 'My Requests',
          desc: 'Check the status of your requests by entering your number.',
          dashboard: 'Dashboard',
          logout: 'Logout',
          access: 'Access',
          phonePlaceholder: '+213 XXX XXX XXX',
          loading: '...',
          no_requests: 'No requests found for this number.',
          login_error: 'Connection Problem',
          login_req: 'Number required',
          delete_error: 'Unable to delete',
          delete_success: 'Request deleted',
          status: {
            pending: 'Pending',
            approved: 'Validated',
            process: 'In Progress',
            fulfilled: 'Completed',
            rejected: 'Rejected'
          }
        },
        search_errors: {
          fetch: 'Unable to load requests'
        },
        contact_dialog: {
          title: 'Contact Waseet',
          desc: 'To protect patient privacy, all communication goes through our secure platform.',
          whatsapp: 'Contact via WhatsApp',
          facebook: 'Contact via Facebook',
          instagram: 'Contact via Instagram'
        },

      },
      classification: {
        severe: 'Critical',
        cancer: 'Cancer',
        surgery: 'Surgery',
        medium: 'Medium',
        diabetes: 'Diabetes',
        normal: 'Normal',
        rare: 'Rare Disease'
      },
      blood: {
        title: 'Blood Donation',
        hero: {
          title: 'Become a Blood Donor',
          subtitle: 'Your blood can save a life. Join our community of heroes today.',
          badge: 'Humanitarian Emergency',
          main_title_1: 'Your Drop of Blood',
          main_title_2: 'Saves a Life',
          description: 'Join our network of anonymous heroes. Every donation counts, every gesture is a hope for someone in need.',
          volunteer: '100% Volunteer',
          impact: 'Immediate Impact'
        },
        profile: {
          access_title: 'Access my Profile',
          access_desc: 'Enter your phone number to manage your information.',
          ph_phone: '+213 XXX XXX XXX',
          btn_access: 'Access',
          not_registered: 'Not registered yet?',
          btn_register: 'Become a Donor',
          welcome: 'Welcome, {{name}}',
          logout: 'Logout',
          eligible: '✅ You are eligible to donate blood!',
          eligible_again: '✅ You can donate again!',
          days_remaining: '⏳ You can donate again in {{count}} days.',
          personal_info: 'Personal Information',
          edit: 'Edit',
          save: 'Save',
          cancel: 'Cancel',
          full_name: 'Full Name',
          age: 'Age',
          phone: 'Phone',
          errors: {
            enter_phone: 'Please enter your phone number',
            update_error: 'Error updating profile'
          },
          update_success: 'Profile updated successfully',
          wilaya: 'Wilaya',
          public_visible: 'Publicly visible',
          emergency_contact: 'Emergency Contact',
          yes: 'Yes',
          no: 'No',
          history: 'History',
          last_donation: 'Last Donation Date',
          no_donation: 'No donation recorded',
          update_error: 'Unable to update profile',
          donor_not_found: 'Donor not found',
          donor_not_found_desc: 'No profile found with this number. Please register first.'
        },
        transport: {
          available_count: 'Available Volunteers ({{count}})',
          loading: 'Loading...',
          empty: 'No volunteers available at the moment.',
          volunteer_badge: 'Volunteer',
          default_desc: 'Free emergency transport.',
          contact_btn: 'Contact Waseet',
          dialog: {
            title: 'Transport Coordination',
            desc: 'For everyone\'s safety, Waseet coordinates transport. Contact us to connect with this volunteer.',
            whatsapp: 'Contact via WhatsApp',
            facebook: 'Contact via Facebook'
          },
          title: 'Transport Volunteers',
          subtitle: 'In case of emergency, every minute counts.',
          find: 'Find Transport',
          join: 'Be a Transporter',
          privacy_note: '<strong>Note:</strong> Your details will <strong>never be displayed publicly</strong>. Waseet will only contact you in case of confirmed emergency.',
          register: {
            title: 'Become a Transport Volunteer',
            subtitle: 'Help save lives by transporting donors for free in emergencies.',
            full_name: 'Full Name *',
            wilaya: 'Wilaya *',
            city: 'City / Municipality *',
            phone: 'Phone Number *',
            other_contacts: 'Other contacts (Optional, visible to admin only)',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            additional_info: 'Additional Information (Optional)',
            additional_placeholder: 'Ex: Available evenings, cannot leave the municipality...',
            visible_admin: 'Visible only to admin.',
            consent_transport: 'I confirm I can provide <strong>free</strong> transport in emergencies.',
            consent_contact: 'I accept to be contacted by Waseet to coordinate emergencies.',
            btn_submit: 'Register as Volunteer',
            btn_submitting: 'Registering...',
            success_title: 'Success',
            success_desc: 'Thank you! You are registered as a transport volunteer.',
            error_title: 'Error',
            error_desc: 'An error occurred.',
            error_consent: 'Please accept the conditions.'
          },
        },
        search: {
          error_fetch: 'Unable to load donor list',
          title: 'Filter Donors',
          filter_blood: 'Blood Type',
          filter_wilaya: 'Wilaya',
          filter_name: 'Search by Name',
          placeholder_name: 'Donor name...',
          results_count: '{{count}} result(s) found',
          reset: 'Reset',
          loading: 'Searching for heroes...',
          empty_title: 'No donors found',
          empty_desc: 'Try changing your search criteria.',
          last_donation: 'Last donation: {{time}}',
          never_donated: 'Never donated',
          days_ago: '{{count}} days ago',
          months_ago: '{{count}} months ago',
          years_ago: '{{count}} year(s) ago',
          urgent_badge: '✅ Available for Emergency',
          call: 'Call',
          note_title: 'Important Note',
          note_desc: 'The information above is provided by donors themselves. Waseet is not responsible for the accuracy of the information. Please treat donors with respect and only contact them in case of real need.'
        },
        register: {
          title: 'Become a Donor',
          subtitle: 'Fill this form to help those in need.',
          success_title: 'Registration Successful!',
          success_desc: 'Thank you for joining our community of heroes. Your gesture can save lives.',
          btn_profile: 'Go to my profile',
          btn_another: 'Register another donor',
          personal_info: 'Personal Information',
          full_name: 'Full Name *',
          phone: 'Phone Number *',
          email: 'Email (optional)',
          age: 'Age * (18-65 years)',
          blood_info: 'Blood Information',
          blood_type: 'Blood Type *',
          last_donation: 'Last Donation (optional)',
          location: 'Location',
          wilaya: 'Wilaya *',
          city: 'City *',
          medical_info: 'Medical Conditions (optional)',
          consent_contact: 'I accept to be contacted for urgent requests',
          consent_public: 'I accept that my info is visible in public list',
          submit: 'Confirm Registration',
          submitting: 'Registering...',
          eligibility_title: 'Important Eligibility Criteria',
          criteria_age: '18-65 years',
          criteria_weight: '+50 kg',
          criteria_health: 'Good general health',
          criteria_recent: 'No recent donation (-3 months)',
          errors: {
            wilaya: 'Wilaya is required',
            city: 'City is required',
            reg_error: 'An error occurred during registration',
            unexpected: 'An unexpected error occurred'
          }
        },
        tabs: {
          search: 'Find a Donor',
          register: 'Become a Donor',
          transport: 'Transport',
          profile: 'My Profile'
        },
        filter: {
          all: 'All'
        }
      },
      store: {
        card: {
          outOfStock: 'Out of Stock',
          onlyLeft: 'Only {{count}} left!',
          noImage: 'No Image',
          view: 'View',
          addToCart: 'Add to Cart'
        },
        filter: {
          label: 'Filter by:',
          placeholder: 'All Product Types',
          all: 'All'
        },
        notFound: {
          title: 'Category Not Found',
          desc: 'The requested category could not be found.'
        },
        noCategories: {
          title: 'No Categories',
          desc: 'No store categories are available at the moment.'
        },
        goHome: 'Go Home',
        searchPlaceholder: 'Search products...',
        clear: 'Clear',
        noProducts: {
          title: 'No Products Found',
          descSearch: 'No products match your search/filter.',
          descEmpty: 'This category is empty.'
        },
        toast: {
          error_title: 'Error',
          load_data_error: 'Failed to load store data.',
          load_products_error: 'Failed to load products.'
        },
        suggestion: {
          btn_trigger: 'Suggest a Product',
          title: 'Suggest a Product',
          personal_info: 'Your Information',
          full_name: 'Full Name *',
          phone: 'Phone Number *',
          whatsapp_label: 'I have WhatsApp',
          whatsapp_placeholder: 'WhatsApp Number',
          telegram_label: 'I have Telegram',
          telegram_placeholder: 'Telegram Username/Number',
          product_details: 'Product Details',
          product_name: 'Product Name *',
          proposed_price: 'Proposed Price *',
          photos_label: 'Product Photos * (At least 1)',
          upload: 'Upload',
          source_info: 'Source Information (Optional)',
          store_name: 'Store Name',
          source_type: 'Source Type',
          source_types: {
            local: 'Local Product',
            imported: 'Imported Product'
          },
          store_location: 'Store Location',
          notes: 'Additional Notes',
          notes_placeholder: 'Any extra details...',
          cancel: 'Cancel',
          submit: 'Submit Suggestion',
          toast: {
            images_uploaded: 'Images uploaded',
            images_desc: 'Successfully uploaded {{count}} images.',
            upload_failed: 'Upload Failed',
            image_required: 'Image Required',
            image_required_desc: 'Please upload at least one photo of the product.',
            success_title: 'Suggestion Sent!',
            success_desc: 'Thank you. Your product suggestion has been sent for review.',
            failed_title: 'Submission Failed'
          }
        }
      },
      admin_alkhayr: {
        title: 'Al-Khayr Administration',
        subtitle: 'Strict Control of Public Content',
        stats: {
          pending: 'Pending',
          online: 'Online (Public)',
          total: 'Total Requests'
        },
        tabs: {
          pending: 'Pending',
          online: 'Online',
          handled: 'Processed',
          rejected: 'Rejected',
          all: 'All'
        },
        card: {
          untitled: '(No Public Title)',
          raw: 'Raw: {{val}}'
        },
        modal: {
          status: {
            pending: 'Pending',
            online: 'Online',
            handled: 'Processed',
            rejected: 'Rejected'
          },
          actions: {
            cancel: 'Cancel',
            save: 'Save Changes'
          },
          title: 'Manage Request #{{id}}',
          section_raw: 'Raw Data (Read Only)',
          section_public: 'Public Space (Curated)',
          requester: 'Requester (Private)',
          location: 'Location (Declared)',
          need: 'Need (Raw)',
          docs: 'Documents & Photos (User)',
          prescription: 'Prescription',
          med_photos: 'Medicine Photos',
          open: 'Open',
          use: 'Use',
          financial: {
            capability: 'Capability',
            offer: 'Offer',
            family: 'Family',
            income: 'Income',
            delivery: 'Delivery'
          },
          form: {
            title: 'Public Title *',
            title_ph: 'e.g., Father in Algiers needs Insulin',
            title_help: 'NEVER put the real name.',
            wilaya: 'Public Wilaya',
            area: 'Area / Neighborhood',
            summary: 'Short Summary (Card) *',
            summary_ph: 'Short summary visible on the card...',
            desc: 'Full Description (Detail)',
            desc_ph: 'Full story, details...',
            gallery: 'Photo Gallery (Display)',
            upload_drag: 'Drag or click',
            use_proof: 'Use User Proof',
            status: 'Status & Visibility',
            urgent_admin: 'Admin Urgency'
          }
        },
      },
      tracking_page: {
        order_prefix: 'ORDER #',
        custom_request_title: 'Custom Product Request',
        more_items: '+{{count}} more',
        status_labels: {
          processing: 'On the way',
          completed: 'Completed',
          rejected: 'Rejected',
          default: 'Processing'
        },
        validation: {
          inputRequired: {
            title: 'Input Required',
            desc: 'Please enter an Order ID or Phone Number.'
          },
          invalidFormat: {
            title: 'Invalid Format',
            desc: 'Please enter a valid Phone Number or Order ID.'
          }
        },
        header: {
          title: 'Track Your Order',
          desc: 'Check the status of your order in real-time.'
        },
        search: {
          placeholder: 'Order ID or Phone Number',
          btn: 'Track Order',
          tip: 'Tip: You can use your phone number to see all your orders.'
        },
        results: {
          back: 'Back to List',
          details: 'Order Details',
          found: 'Found {{count}} orders',
          noOrders: {
            title: 'No Orders Found',
            desc: 'We couldn\'t find any orders matching "{{query}}".\nPlease check your input or contact support.'
          }
        }
      },
      verification_page: {
        title: 'My Orders',
        desc: 'Enter your phone number to see all your requests.',
        card_title: 'Find Your Orders',
        card_desc: 'We will look up orders linked to your phone number.',
        phone_label: 'Phone Number',
        btn_searching: 'Searching...',
        btn_find: 'Find Orders',
        results_count: 'Found {{count}} Orders',
        no_orders: 'No {{filter}} orders found.',
        filters: {
          all: 'all',
          active: 'active',
          completed: 'completed',
          cancelled: 'cancelled'
        },
        toast: {
          phone_required: 'Phone Required',
          phone_desc: 'Please enter your phone number to find your orders.',
          error_title: 'Error',
          error_desc: 'Failed to fetch orders. Please check your connection.'
        }
      },
      admin_orders: {
        title: 'Order Management',
        subtitle: 'View and manage all customer orders.',
        listTitle: 'Recent Orders',
        searchPlaceholder: 'Search by Order ID, Customer, or Product...',
        filterType: {
          all: 'All Types'
        },
        status: {
          all: 'All Statuses'
        },
        table: {
          id: 'Order ID',
          type: 'Type',
          product: 'Product / Details',
          customer: 'Customer',
          contact: 'Contact',
          total: 'Total',
          status: 'Status',
          date: 'Date',
          actions: 'Actions'
        },
        badges: {
          store: 'Store Order',
          custom: 'Custom Request'
        },
        externalLink: 'External Link'
      },

      register_agent: {
        hero: {
          title: 'Join as an Import Agent',
          subtitle: 'Help bring items from abroad and earn by facilitating logistics.'
        },
        personal: {
          title: 'Personal & Contact Info',
          name: 'Full Name *',
          country: 'Current Country *',
          city: 'City *',
          email: 'Email Address *',
          phone: 'Phone Number (WhatsApp) *',
          telegram: 'Telegram (Optional)',
          placeholders: {
            name: 'e.g. John Doe',
            country: 'e.g. France',
            city: 'e.g. Paris',
            email: 'john@example.com',
            phone: '+33 6 12 34 56 78',
            telegram: '@username'
          }
        },
        capabilities: {
          title: 'Import Capabilities',
          countries_label: 'Countries you can ship from *',
          countries_placeholder: 'e.g. France, Germany, Spain (comma separated)',
          countries_hint: 'List all countries where you have a presence or can ship from.',
          methods_label: 'Shipping Methods Supported',
          methods: {
            air: 'Air Cargo',
            sea: 'Sea Freight',
            hand: 'Hand-carry (Traveler)'
          },
          methods_placeholder: 'e.g. Air Cargo, DHL, Personal Transport',
          frequency_label: 'Frequency of Shipments',
          freq_regular: 'Regular',
          freq_regular_desc: 'Weekly or monthly schedule',
          freq_occasional: 'Occasional',
          freq_occasional_desc: 'Based on travel/demand'
        },
        categories: {
          title: 'Product Categories',
          label: 'What can you handle?',
          options: {
            electronics: 'Electronics',
            clothing: 'Clothing',
            medical: 'Medical Items',
            cosmetics: 'Cosmetics',
            auto: 'Auto Parts',
            general: 'General Goods'
          },
          other_label: 'Other (please specify)',
          other_placeholder: 'e.g. Heavy machinery, Documents...'
        },
        pricing: {
          title: 'Pricing Information (Optional)',
          subtitle: "This helps us estimate costs but isn't binding. Final pricing is confirmed manually per request.",
          price_per_kg: 'Price per KG',
          currency: 'Currency',
          type: 'Pricing Type',
          types: {
            fixed: 'Fixed Rate',
            negotiable: 'Estimated / Negotiable'
          }
        },
        additional: {
          title: 'Additional Notes',
          placeholder: 'Tell us about your experience, specific constraints, or anything else...'
        },
        legal: {
          title: 'Terms & Agreement',
          broker: 'I understand that Waseet acts as a broker only and connects me with verified requests.',
          admin: 'I agree that all coordination is subject to admin approval before sharing my details with customers.',
          terms: 'I accept the terms and conditions and certify that provided information is accurate.',
          submit: 'Submit Registration',
          submitting: 'Submitting Application...'
        },
        success: {
          title: 'Registration Received',
          desc: 'Your registration (ID #{{id}}) has been received and is under review. The admin team will contact you if your profile matches our needs.',
          home_btn: 'Return Home'
        },
        validation: {
          name: 'Full Name is required',
          country: 'Current Country is required',
          city: 'City is required',
          phone: 'Phone number is required',
          email: 'Valid Email is required',
          countries: 'List at least one country you can ship from',
          broker: 'You must acknowledge Waseet acts as a broker only',
          admin: 'You must agree to Admin coordination',
          terms: 'You must accept the terms and conditions',
          title: 'Validation Needed',
          error_title: 'Error',
          default_error: 'Failed to submit'
        }
      },
      request_import: {
        blocked: {
          title: 'Unavailable for now',
          desc: 'This feature will return soon. Click OK to return home.',
          btn: 'OK'
        },
        title: 'Request Import',
        subtitle: 'Submit an international import request for review.',
        sections: {
          contact: 'Contact',
          origin: 'Origin',
          product: 'Product',
          options: 'Options',
          confirmation: 'Confirmation',
          tips: 'Tips'
        },
        contact: {
          name: 'Customer Name',
          name_ph: 'Optional',
          method: 'Contact Method',
          value: 'Contact Value *',
          value_ph: '+2135XXXXXXXX'
        },
        origin: {
          country: 'Origin Country *',
          country_ph: 'France',
          city: 'Origin City',
          city_ph: 'Paris'
        },
        product: {
          desc: 'Description *',
          desc_ph: 'Brand / Model / Size',
          links: 'Link(s) (optional)',
          links_ph: 'One per line or comma-separated',
          currency: 'Currency',
          value: 'Value *',
          value_ph: '129.99',
          quantity: 'Quantity *'
        },
        options: {
          priority: 'Shipping Priority',
          priorities: {
            normal: 'normal',
            express: 'express'
          },
          delivery: 'Delivery Method',
          deliveries: {
            home: 'home',
            pickup: 'pickup'
          }
        },
        confirmation: {
          terms: 'I accept service fee and terms *',
          submit: 'Submit Request',
          submitting: 'Submitting...',
          modal: {
            title: 'Confirm your request',
            cancel: 'Cancel',
            confirm: 'Confirm & Submit'
          }
        },
        tips: {
          title: 'Tips',
          t1: 'Provide clear brand/model details for faster verification.',
          t2: 'WhatsApp gives quicker status updates than email/phone.',
          t3: 'Express shipping increases cost; choose only if urgent.'
        },
        validation: {
          contact: 'WhatsApp/Email/Phone is required',
          country: 'Origin country is required',
          desc: 'Product description is required',
          value: 'Product value is required',
          quantity: 'Quantity must be at least 1',
          terms: 'You must accept the terms',
          title: 'Validation',
          sent: 'Request submitted',
          sent_desc_id: 'Your request #{{id}} has been received.',
          error: 'Error',
          wait: 'Please wait',
          wait_desc: 'You can submit again in a minute'
        }
      }
    },
  },
  fr: {
    translation: {
      yes: 'Oui',
      no: 'Non',
      nav: {
        home: 'Accueil',
        order: 'Commander',
        track: 'Suivre la commande',
        earn: 'Gagner des récompenses',
        verify: 'Vérifier',
        about: 'À propos',
        contact: 'Contact',
        exchange: 'Échange',
        internationalAgent: 'Agent International',
        agent: {
          requestImport: 'Demande d\'importation',
          registerAgent: 'S’inscrire comme Agent'
        },
        store: 'Boutique',
        alkhayr_label: 'Al-Khayr',
        waseet: 'Waseet'
      },
      cart: {
        title: 'Votre Panier',
        empty: 'Votre panier est vide',
        start_shopping: 'Commencer vos achats',
        no_img: 'Sans img',
        subtotal: 'Sous-total',
        shipping: 'Livraison',
        shipping_home: 'Livraison (Domicile)',
        shipping_desk: 'Livraison (Stopdesk)',
        shipping_to: 'Livraison vers :',
        change: 'Modifier',
        select_wilaya: 'Sélectionner Wilaya',
        select_address: 'Sélectionner Adresse',
        total: 'Total',
        checkout_details: 'Détails de la commande',
        name: 'Nom complet *',
        name_placeholder: 'Jean Dupont',
        phone: 'Numéro de téléphone *',
        phone_placeholder: '+213...',
        email: 'Email (Optionnel)',
        email_placeholder: 'jean@example.com',
        additional_contact: 'Méthodes de contact supplémentaires (Optionnel)',
        whatsapp: 'WhatsApp',
        whatsapp_placeholder: 'Numéro WhatsApp (+213...)',
        telegram: 'Telegram',
        telegram_placeholder: 'Telegram @nomutilisateur',
        place_order: 'Commander',
        processing: 'Traitement...',
        close: 'Fermer',
        order_success_title: 'Commande passée avec succès',
        order_success_desc: 'Nous avons bien reçu votre commande.',
        contact_shortly: 'Nous vous contacterons bientôt pour confirmer votre commande.',
        keep_ref: 'Veuillez conserver ces numéros de commande pour référence.',
        validation: {
          missing_shipping_title: 'Info de livraison manquante',
          missing_shipping_desc: 'Veuillez fournir votre adresse de livraison.',
          missing_name_title: 'Nom manquant',
          missing_name_desc: 'Veuillez entrer votre nom complet.',
          missing_phone_title: 'Téléphone manquant',
          missing_phone_desc: 'Veuillez entrer votre numéro de téléphone obligatoire.',
          missing_whatsapp_title: 'WhatsApp manquant',
          missing_whatsapp_desc: "Veuillez entrer votre numéro WhatsApp ou décocher l'option.",
          missing_telegram_title: 'Telegram manquant',
          missing_telegram_desc: "Veuillez entrer votre nom d'utilisateur Telegram ou décocher l'option."
        },
        order_failed_title: 'Échec de la commande',
        order_failed_desc: 'Une erreur s\'est produite. Veuillez réessayer.'
      },
      footer: {
        home: 'Accueil',
        order: 'Commander',
        trackOrder: 'Suivre la commande',
        exchange: 'Échange',
        contact: 'Contact',
        rights: 'Tous droits réservés.',
        services: 'Services',
        support: 'Support',
        connect: 'Suivez-nous',
        importRequest: "Demande d'importation",
        aboutUs: 'À propos',
        verified_badge: 'Demandes vérifiées humainement • Service de courtage',
        privacy: 'Confidentialité',
        terms: 'Conditions',
        cookies: 'Cookies',
        brandDesc: 'Waseet est une plateforme de courtage de confiance reliant les personnes à la logistique, aux échanges et aux services vérifiés.'
      },

      referral: {
        headerTitle: 'Gagnez des Récompenses avec le Parrainage',
        headerDesc: 'Partagez votre code et gagnez 1000 DA pour chaque 200 $ d\'achats effectués avec votre code',
        genTitle: 'Générez Votre Code de Parrainage',
        genDesc: 'Entrez vos coordonnées pour créer votre code unique',
        contactMethod: 'Méthode de Contact',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        labels: { whatsapp: 'Numéro WhatsApp', telegram: 'Nom d\'utilisateur Telegram' },
        placeholders: { whatsapp: '+213550123456', telegram: '@votreutilisateur' },
        actions: { generate: 'Générer Mon Code', generating: 'Génération...', verify: 'Vérifier Mes Gains', checking: 'Vérification...' },
        toast: {
          error: 'Erreur',
          contact_required: 'Veuillez entrer vos coordonnées',
          phone_invalid: 'Format doit être +2135/6/7 + 8 chiffres',
          existing_title: 'Un code existe déjà !',
          existing_desc: 'Voici votre code de parrainage existant',
          success_title: 'Succès !',
          success_desc: 'Votre code de parrainage a été généré',
          check_none_title: 'Aucun code trouvé',
          check_none_desc: "Aucun code de parrainage n'existe pour ce contact",
          check_found_title: 'Statistiques trouvées !',
          check_found_desc: 'Voici vos statistiques de parrainage',
          copied_title: 'Copié !',
          copied_desc: 'Code de parrainage copié dans le presse-papiers'
        },
        stats: {
          your_code: 'Votre Code de Parrainage',
          total_collected: 'Total collecté',
          rewards: 'Récompenses',
          total_earned: 'Total gagné',
          milestone_prefix: 'Plus que',
          milestone_suffix: 'pour gagner',
          milestone_reward: '1000 DA'
        },
        withdraw: {
          button: 'Demander un Retrait',
          available_balance: 'Solde Disponible',
          ready: 'Prêt à retirer',
          pending_approval: 'En attente d\'approbation',
          pending_request: 'Demande en attente',
          request_submitted: 'Demande envoyée',
          success_title: 'Demande Envoyée !',
          success_desc: 'Votre demande de retrait sera traitée sous peu'
        },
        generateAnother: 'Générer un autre code',
        contactLabel: 'Contact : {{type}} - {{value}}',
        howItWorks: {
          title: 'Comment ça marche :',
          step1: 'Partagez votre code avec vos amis',
          step2: 'Ils entrent votre code lors de l\'achat',
          step3: 'Chaque 200 $ d\'achats = 1000 DA pour vous',
          step4: 'Pas de limite ! Continuez à gagner',
          example: 'Exemple : Si les achats avec votre code atteignent 600 $, vous gagnez 3000 DA'
        },
        self_referral_note: 'Vous ne pouvez pas gagner de récompenses en utilisant votre propre code.'
      },
      verify: {
        title: 'Vérifier Mes Achats',
        subtitle: 'Entrez votre WhatsApp ou Telegram pour voir vos commandes',
        cardTitle: 'Trouver Vos Commandes',
        cardDesc: "Nous rechercherons les commandes par vos coordonnées",
        contactMethod: 'Méthode de Contact',
        labels: { whatsapp: 'WhatsApp', telegram: 'Telegram', number: 'Numéro WhatsApp', username: 'Nom utilisateur Telegram' },
        placeholders: { whatsapp: '+213550123456', telegram: '@votreutilisateur' },
        actions: { verify: 'Vérifier Mes Achats', checking: 'Vérification...' },
        toast: {
          error: 'Erreur',
          contact_required: 'Veuillez entrer votre contact',
          phone_invalid: 'Format invalide',
          no_purchases_title: 'Aucun achat trouvé',
          no_purchases_desc: "Nous n'avons trouvé aucune commande pour ce contact",
          fetch_error_title: 'Erreur',
          fetch_error_desc: 'Échec de la récupération des achats'
        },
        results: { title: 'Vos Commandes', found: '{{count}} trouvées', order: 'Commande #{{id}}', productLink: 'Lien Produit' }
      },

      about: {
        hero: {
          title: 'À propos de Waseet',
          subtitle: 'Votre courtier de confiance faisant le pont entre les besoins locaux et les opportunités internationales.'
        },
        what: {
          title: 'Qu\'est-ce que Waseet ?',
          desc1: 'Waseet est une plateforme de courtage de services conçue pour simplifier les transactions complexes pour les utilisateurs algériens. Nous agissons comme intermédiaire sécurisé, vous connectant aux produits, opportunités de change et marchés internationaux.',
          desc2: 'Nous fonctionnons sur un modèle <strong>"humain dans la boucle"</strong>. Cela signifie que chaque demande est personnellement examinée et traitée par notre équipe, garantissant sécurité et précision plutôt que de compter sur une automatisation aveugle.',
          cards: {
            mediated: 'Service Médiatisé',
            secure: 'Processus Sécurisé'
          }
        },
        services: {
          title: 'Ce Que Nous Faisons',
          subtitle: 'Nos services principaux simplifient votre accès à l\'économie numérique.',
          cards: {
            store: { title: 'Boutique et Commande', desc: 'Parcourez notre boutique sélectionnée pour des articles très demandés. Vous pouvez passer commande sans créer de compte. Chaque commande est examinée manuellement pour confirmer la disponibilité et les détails d\'expédition selon votre Wilaya avant traitement.' },
            exchange: { title: 'Change de Devises', desc: 'Soumettez des demandes d\'achat ou de vente de devises standard. Nos taux sont indicatifs et fixés par nos administrateurs. Nous traitons ces demandes manuellement pour assurer un environnement d\'échange sûr pour toutes les parties.' },
            import: { title: 'Importation et Logistique', desc: 'Accédez aux marchés internationaux via notre service d\'importation personnalisé (Bientôt disponible). Nous collaborons également avec des partenaires logistiques vérifiés pour gérer l\'expédition. Tous les partenariats d\'agents sont vérifiés manuellement.' }
          }
        },
        how: {
          title: 'Comment Ça Marche',
          steps: {
            1: { title: 'Demande', desc: 'Vous soumettez votre commande, échange ou demande d\'importation via nos formulaires simples.' },
            2: { title: 'Revue', desc: 'Notre équipe vérifie personnellement les détails, le stock et les taux pour précision.' },
            3: { title: 'Contact', desc: 'Nous vous contactons par téléphone ou WhatsApp pour confirmer et finaliser.' },
            4: { title: 'Mise à Jour', desc: 'Suivez votre statut à tout moment en utilisant votre ID de commande sur notre page de suivi.' }
          }
        },
        why: {
          title: 'Pourquoi Choisir Waseet ?',
          items: {
            adapted: { title: 'Adapté à l\'Algérie', desc: 'Conçu spécifiquement pour le contexte et les défis locaux.' },
            human: { title: 'Vérification Humaine', desc: 'Nous priorisons la sécurité sur la vitesse. Chaque transaction est surveillée.' },
            centralized: { title: 'Service Centralisé', desc: 'Services multiples (Achats, Change, Import) en un seul endroit de confiance.' }
          }
        },
        notice: {
          title: 'Avis de Transparence Important',
          desc: 'Pour assurer une confiance et une transparence totales avec nos utilisateurs, nous voulons être clairs sur ce que nous ne sommes PAS :',
          items: {
            1: 'Nous ne sommes <strong>PAS une banque</strong> ou une institution financière officielle.',
            2: 'Nous ne traitons <strong>PAS les paiements automatiquement</strong>. Tous les fonds sont gérés de manière sécurisée via des canaux manuels vérifiés.',
            3: 'Le placement d\'une demande agit comme une réservation, pas une garantie instantanée. La confirmation suit peu après examen.'
          }
        },
        footer: {
          title: 'Questions ?',
          desc: 'Notre équipe est là pour vous aider à naviguer dans nos services.',
          support: 'Support disponible via WhatsApp et Email'
        }
      },



      contact: {
        title: 'Contactez-nous',
        subtitle: "Des questions ? Nous sommes là pour vous aider. Contactez-nous via l'un de ces canaux.",
        whatsapp_title: 'WhatsApp',
        whatsapp_desc: 'Discutez avec nous sur WhatsApp',
        telegram_title: 'Telegram',
        telegram_desc: 'Écrivez-nous sur Telegram',
        email_title: 'Email',
        email_desc: 'Envoyez-nous un email',
        hours_title: 'Horaires',
        hours_desc: 'Nous sommes disponibles aux horaires suivants',
        days: { monfri: 'Lundi - Vendredi', sat: 'Samedi', sun: 'Dimanche' },
        times: { monfri: '09:00 - 18:00', sat: '10:00 - 16:00', sun: 'Fermé' }
      },
      home: {
        hero: {
          title_prefix: 'Courtage de confiance pour',
          title_highlight: 'Logistique & Change',
          subtitle: 'Waseet vous connecte aux marchés internationaux et au change de devises via un processus sécurisé et vérifié par des humains. Professionnel, transparent et conçu pour l\'Algérie.',
          cta_explore: 'Explorer les services',
          cta_track: 'Suivre une commande'
        },
        services: {
          title: 'Nos Services',
          subtitle: 'Des solutions professionnelles pour vos besoins internationaux.',
          marketplace: {
            title: 'Marketplace',
            desc: 'Accédez à des produits sélectionnés avec une tarification transparente. Commandez facilement et laissez-nous gérer la logistique jusqu\'à votre wilaya.',
            btn: 'Parcourir la boutique'
          },
          exchange: {
            title: 'Change de Devises',
            desc: 'Courtage sécurisé pour les transactions de devises. Nous vérifions chaque demande manuellement pour garantir sécurité et fiabilité.',
            btn: 'Taux de change'
          },
          import: {
            title: 'Import Personnalisé',
            desc: 'Demandez des articles spécifiques des marchés internationaux. Nous vérifions la disponibilité et fournissons un devis confirmé incluant la livraison.',
            btn: 'Demander un devis'
          },
          tracking: {
            title: 'Suivi de Commande',
            desc: 'Mises à jour de statut en temps réel pour toutes vos transactions. Entrez simplement votre ID de commande pour vérifier la progression.',
            btn: 'Suivre le statut'
          }
        },
        how: {
          title: 'Comment fonctionne la plateforme',
          subtitle: 'Un processus simple et vérifié par des humains pour chaque demande.',
          steps: {
            1: { title: 'Soumettre une demande', desc: 'Commandez, échangez ou importez via nos formulaires.' },
            2: { title: 'Revue de l\'équipe', desc: 'Nous vérifions manuellement les détails et la disponibilité.' },
            3: { title: 'Confirmation', desc: 'Vous recevez une approbation avant toute action.' },
            4: { title: 'Suivi de progression', desc: 'Suivez les mises à jour de statut jusqu\'à la finalisation.' }
          },
          manual_note: 'Pas d\'exécution automatique. Chaque étape est vérifiée par un humain.'
        },
        trust: {
          title: 'Basé sur des processus, pas des promesses',
          subtitle: 'Nous priorisons la sécurité, la transparence et la clarté plutôt que la vitesse.',
          cards: {
            review: { title: 'Revue Humaine', desc: 'Chaque demande est examinée manuellement. Pas de traitement aveugle—nous confirmons les détails d\'abord.' },
            comms: { title: 'Comms Claires', desc: 'Nous vérifions les prix et délais avec vous avant d\'agir. Vous n\'êtes jamais laissé dans le doute.' },
            broker: { title: 'Rôle de Courtier', desc: 'Nous agissons comme votre courtier, coordonnant et vérifiant les transactions pour garder le contrôle entre vos mains.' },
            local: { title: 'Réalité Locale', desc: 'Conçu pour l\'Algérie. De la logistique par wilaya aux vérifications manuelles, nous connaissons le contexte.' }
          }
        },
        who: {
          title: 'Qui utilise Waseet ?',
          shoppers: { title: 'Acheteurs Internationaux', desc: 'Individus voulant acheter à l\'étranger mais ayant besoin d\'un intermédiaire de confiance.' },
          exchangers: { title: 'Échangeurs de Devises', desc: 'Personnes ayant besoin de services de change sécurisés et coordonnés sans risque.' },
          verification: { title: 'Chercheurs de Vérification', desc: 'Utilisateurs préférant une confirmation humaine plutôt que des systèmes automatisés aveugles.' }
        },
        transparency: {
          title: 'Ce que Waseet n\'est pas',
          items: {
            1: 'Waseet n\'est <strong>pas une banque</strong> et ne détient pas de fonds comme un portefeuille.',
            2: 'Waseet n\'exécute <strong>pas de paiements automatiques</strong> sans revue.',
            3: 'Waseet ne <strong>garantit pas la disponibilité</strong> instantanément ; une confirmation est requise.'
          }
        },
        ready: {
          title: 'Prêt à commencer ?',
          explore: 'Explorer les services',
          support: 'Contacter le support'
        }
      },
      order: {
        header: {
          title: 'Nouvelle Commande',
          subtitle: 'Rapide. Simple. Mondial.'
        },
        product: {
          title: 'Information Produit',
          name: 'Nom du Produit',
          name_ph: 'ex: iPhone 15 Pro Max',
          url: 'URL du Produit *',
          url_ph: 'https://amazon.fr/produit',
          price: 'Prix du Produit *',
          shipping: 'Livraison ($)'
        },
        personal: {
          title: 'Vos Informations',
          name: 'Nom Complet *',
          name_ph: 'Jean Dupont',
          contact_method: 'Méthode de Contact *',
          whatsapp: 'WhatsApp',
          telegram: 'Telegram',
          contact_ph_whatsapp: '+213550123456',
          contact_ph_telegram: '@username'
        },
        optional: {
          referral: 'Code de Parrainage (Optionnel)',
          referral_ph: 'ABCD1234',
          notes: 'Notes',
          notes_ph: 'Couleur, taille, instructions spéciales...'
        },
        actions: {
          processing: 'Traitement en cours...',
          place: 'Passer la Commande',
          add_to_cart: 'Ajouter au Panier'
        },
        summary: {
          title: 'Résumé de la Commande',
          product: 'Produit',
          shipping: 'Livraison',
          total: 'Total',
          usd_total: 'Total (USD)',
          dzd: 'Dinar Algérien'
        },
        benefits: {
          secure_title: 'Paiement Sécurisé',
          secure_desc: 'Vos données sont chiffrées',
          fast_title: 'Traitement Rapide',
          fast_desc: 'Commandes confirmées sous 24h',
          track_title: 'Suivi en Temps Réel',
          track_desc: 'Suivez votre commande à chaque étape'
        },
        validation: {
          error: 'Erreur',
          url_required: 'L\'URL du produit est requise',
          url_invalid: 'Veuillez entrer une URL valide commençant par http:// ou https://',
          price_required: 'Veuillez entrer un prix de produit valide',
          name_required: 'Le nom est requis',
          contact_required: 'Les informations de contact sont requises',
          phone_invalid: 'Le numéro doit être au format +213 5/6/7 suivi de 8 chiffres',
          self_referral: 'Vous ne pouvez pas utiliser votre propre code de parrainage.',
          invalid_referral: 'Code de parrainage introuvable.'
        },
        success: {
          title: 'Succès !',
          desc: 'Votre commande a été soumise avec succès'
        },
        toast: {
          added: 'Ajouté au panier',
          added_desc: 'Produit ajouté à votre panier'
        },
        error: {
          title: 'Erreur',
          generic: 'Échec de la soumission de la commande. Veuillez réessayer.'
        }
      },
      product_details: {
        notFound: {
          title: 'Produit Introuvable',
          desc: 'Le produit que vous cherchez n\'existe pas ou a été supprimé.'
        },
        backToStore: 'Retour à la Boutique',
        back: 'Retour',
        inStock: 'En Stock',
        addToCart: 'Ajouter au Panier',
        freeShipping: 'Livraison gratuite pour les commandes de plus de 100$',
        securePayment: 'Paiement sécurisé',
        noDescription: 'Aucune description disponible.'
      },
      store: {
        notFound: {
          title: 'Catégorie Introuvable',
          desc: 'La catégorie demandée est introuvable.'
        },
        noCategories: {
          title: 'Aucune Catégorie',
          desc: 'Aucune catégorie de boutique disponible pour le moment.'
        },
        goHome: 'Accueil',
        searchPlaceholder: 'Rechercher des produits...',
        clear: 'Effacer',
        noProducts: {
          title: 'Aucun Produit Trouvé',
          descSearch: 'Aucun produit ne correspond à votre recherche.',
          descEmpty: 'Cette catégorie est vide.'
        },
        card: {
          outOfStock: 'Rupture de Stock',
          onlyLeft: 'Plus que {{count}} !',
          noImage: 'Pas d\'image',
          view: 'Voir',
          addToCart: 'Ajouter au Panier'
        },
        filter: {
          label: 'Filtrer par :',
          placeholder: 'Tous les Types',
          all: 'Tous les Types'
        },
        toast: {
          error_title: 'Erreur',
          load_data_error: 'Erreur de chargement des données de la boutique.',
          load_products_error: 'Erreur de chargement des produits.'
        },
        suggestion: {
          btn_trigger: 'Suggérer un Produit',
          title: 'Suggérer un Produit',
          personal_info: 'Vos Informations',
          full_name: 'Nom Complet *',
          phone: 'Numéro de Téléphone *',
          whatsapp_label: 'J\'ai WhatsApp',
          whatsapp_placeholder: 'Numéro WhatsApp',
          telegram_label: 'J\'ai Telegram',
          telegram_placeholder: 'Utilisateur/Numéro Telegram',
          product_details: 'Détails du Produit',
          product_name: 'Nom du Produit *',
          proposed_price: 'Prix Proposé *',
          photos_label: 'Photos du Produit * (Au moins 1)',
          upload: 'Télécharger',
          source_info: 'Info Source (Optionnel)',
          store_name: 'Nom du Magasin',
          source_type: 'Type de Source',
          source_types: {
            local: 'Produit Local',
            imported: 'Produit Importé'
          },
          store_location: 'Emplacement du Magasin',
          notes: 'Notes Supplémentaires',
          notes_placeholder: 'Détails supplémentaires...',
          cancel: 'Annuler',
          submit: 'Soumettre la Suggestion',
          toast: {
            images_uploaded: 'Images téléchargées',
            images_desc: '{{count}} images téléchargées avec succès.',
            upload_failed: 'Échec du Téléchargement',
            image_required: 'Image Requise',
            image_required_desc: 'Veuillez télécharger au moins une photo du produit.',
            success_title: 'Suggestion Envoyée !',
            success_desc: 'Merci. Votre suggestion de produit a été envoyée pour examen.',
            failed_title: 'Échec de l\'envoi'
          }
        }
      },

      exchange: {
        title: 'Courtier de Change Sécurisé',
        subtitle: 'Échange P2P rapide, sécurisé et médiatisé. Nous garantissons la sécurité de chaque transaction.',
        have: {
          step: '1',
          title: 'J\'ai',
          currency: 'Devise à Vendre',
          payment: 'Mode de Paiement (Dépôt)',
          amount: 'Montant'
        },
        want: {
          step: '2',
          title: 'Je Veux',
          currency: 'Devise à Acheter',
          payment: 'Mode de Paiement (Réception)',
          total: 'Total Estimé'
        },
        location: {
          wilaya: 'Wilaya (Localisation)',
          neededBy: 'Pour quand en avez-vous besoin ?'
        },
        private: {
          title: 'Coordonnées Privées',
          subtitle: '(Visible uniquement par l\'admin)',
          email: 'Email',
          phone: 'Numéro de Téléphone',
          whatsapp: 'WhatsApp (Optionnel)',
          telegram: 'Telegram (Optionnel)'
        },
        form: {
          terms_label: 'J\'accepte les conditions de service. Je comprends que Waseet agit comme courtier et que cette demande est soumise à examen manuel.',
          submit_btn: 'Soumettre Demande Sécurisée',
          submitting: 'Envoi...',
          placeholder: {
            select_currency: 'Choisir Devise',
            select_method: 'Choisir Méthode',
            any_method: 'Toute méthode',
            select_wilaya: 'Choisir Wilaya',
            amount: '0.00'
          }
        },
        success: {
          title: 'Demande Soumise',
          desc: 'Nous avons bien reçu votre demande d\'échange sécurisée.',
          id_prefix: 'ID: #'
        },
        validation: {
          terms: 'Veuillez accepter les conditions',
          required: 'Veuillez remplir tous les champs',
          amount: 'Veuillez entrer un montant valide',
          date: 'Veuillez sélectionner une date',
          email: 'L\'email est requis',
          phone: 'Le téléphone est requis',
          submit_error: 'Échec de l\'envoi'
        }
      },
      exchange_sidebar: {
        howTitle: 'Comment ça marche',
        step1: 'Choisissez le type (Acheter / Vendre).',
        step2: 'Sélectionnez les devises et entrez la quantité.',
        step3: 'Saisissez vos méthodes de paiement.',
        step4: 'Renseignez vos coordonnées et joignez des fichiers si nécessaire.',
        step5: 'Acceptez les termes puis envoyez.',
        securityTitle: 'Sécurité & Conseils',
        securityBody: 'Nous vérifions chaque demande manuellement. Ne partagez jamais de mots de passe ou codes sensibles. La vérification peut prendre jusqu’à 24h.'
      },
      admin_orders: {
        title: 'Commerce & Commandes',
        subtitle: 'Gérer les commandes boutique et achats perso.',
        listTitle: 'Liste des Commandes',
        searchPlaceholder: 'Rechercher commandes...',
        filterType: {
          all: 'Tous Types',
          store: 'Boutique',
          custom: 'Perso'
        },
        status: {
          all: 'Tous Statuts',
          new: 'Nouveau',
          processing: 'Traitement',
          done: 'Terminé',
          cancelled: 'Annulé'
        },
        table: {
          id: 'ID',
          type: 'Type',
          product: 'Produit',
          customer: 'Client',
          contact: 'Contact',
          total: 'Total',
          status: 'Statut',
          date: 'Date',
          actions: 'Actions'
        },
        noOrders: 'Aucune commande trouvée',
        externalLink: 'Lien Externe',
        viewDetails: 'Voir Détails',
        badges: {
          custom: 'Perso',
          store: 'Boutique'
        }
      },
      admin_store: {
        management: {
          title: 'Gestion Boutique',
          desc: 'Gérer catégories, produits et types',
          tabs: {
            categories: 'Catégories',
            products: 'Produits',
            types: 'Types de Produits'
          }
        },
        categories: {
          title: 'Catégories',
          add: 'Ajouter Catégorie',
          edit: 'Modifier',
          manageDesc: 'Gérer infos catégories.',
          table: {
            name: 'Nom',
            badge: 'Badge',
            slug: 'Slug',
            status: 'Statut',
            order: 'Ordre',
            actions: 'Actions',
            active: 'Actif',
            inactive: 'Inactif'
          },
          form: {
            name: 'Nom *',
            slug: 'Slug *',
            badgeLabel: 'Libellé Badge *',
            badgeColor: 'Couleur Badge'
          },
          messages: {
            validation: 'Remplir champs requis.',
            updated: 'Catégorie mise à jour.',
            created: 'Catégorie créée.',
            deleted: 'Catégorie supprimée.',
            confirmDelete: 'Supprimer cette catégorie ?'
          }
        },
        products: {
          title: 'Produits',
          add: 'Ajouter Produit',
          edit: 'Modifier Produit',
          manageDesc: 'Gérer infos et images produits.',
          noCategories: {
            title: 'Pas de Catégories',
            desc: 'Créez une catégorie d\'abord.',
            boxTitle: 'Aucune catégorie trouvée.',
            boxDesc: 'Créez une catégorie d\'abord.'
          },
          form: {
            category: 'Catégorie *',
            type: 'Type',
            name: 'Nom *',
            slug: 'Slug *',
            price: 'Prix *',
            stock: 'Stock',
            desc: 'Description',
            status: 'Statut',
            images: 'Images',
            placeholders: {
              selectCategory: 'Choisir catégorie',
              selectType: 'Choisir type (optionnel)',
              none: 'Aucun',
              unlimited: 'Vide pour illimité'
            }
          },
          table: {
            category: 'Catégorie',
            price: 'Prix',
            stock: 'Stock',
            status: 'Statut',
            actions: 'Actions',
            inStock: '{{count}} en stock',
            outOfStock: 'Épuisé',
            unlimited: 'Illimité'
          },
          messages: {
            updated: 'Produit mis à jour.',
            created: 'Produit créé.',
            deleted: 'Produit supprimé.',
            imagesUploaded: 'Images téléchargées.',
            confirmDelete: 'Supprimer ce produit ?'
          }
        },
        types: {
          title: 'Types de Produits',
          add: 'Ajouter Type',
          edit: 'Modifier Type',
          manageDesc: 'Gérer types produits.',
          table: {
            name: 'Nom',
            category: 'Catégorie',
            slug: 'Slug',
            status: 'Statut',
            order: 'Ordre',
            actions: 'Actions',
            active: 'Actif',
            inactive: 'Inactif'
          },
          form: {
            category: 'Catégorie *',
            name: 'Nom *',
            slug: 'Slug *',
            desc: 'Description',
            order: 'Ordre',
            active: 'Actif',
            placeholders: {
              selectCategory: 'Choisir catégorie',
              name: 'Équipement',
              slug: 'equipement',
              desc: 'Description...'
            }
          },
          messages: {
            validation: 'Remplir champs requis.',
            updated: 'Type mis à jour.',
            created: 'Type créé.',
            deleted: 'Type supprimé.',
            confirmDelete: 'Supprimer ce type ?'
          }
        },
        suggestions: {
          title: 'Suggestions Produits',
          subtitle: 'Revoir produits suggérés.',
          listTitle: 'Liste Suggestions',
          search: {
            placeholder: 'Chercher produit ou utilisateur...',
            filter: 'Filtrer par Statut'
          },
          status: {
            all: 'Tous Statuts',
            pending: 'En Attente',
            reviewed: 'Revue',
            accepted: 'Acceptée',
            rejected: 'Rejetée'
          },
          table: {
            product: 'Nom Produit',
            price: 'Prix',
            user: 'Utilisateur',
            status: 'Statut',
            date: 'Date',
            actions: 'Actions'
          },
          messages: {
            empty: 'Aucune suggestion trouvée.',
            errorFetch: 'Échec récupération suggestions.'
          },
          actions: {
            review: 'Revoir'
          }
        }
      },
      admin_alkhayr: {
        title: 'Administration Al-Khayr',
        subtitle: 'Contrôle Strict du Contenu Public',
        stats: {
          pending: 'En Attente',
          online: 'En Ligne (Public)',
          total: 'Total Demandes'
        },
        tabs: {
          pending: 'En Attente',
          online: 'En Ligne',
          handled: 'Traitées',
          rejected: 'Rejetées',
          all: 'Toutes'
        },
        card: {
          untitled: '(Pas de Titre Public)',
          raw: 'Brut: {{val}}'
        },
        modal: {
          title: 'Gérer Demande #{{id}}',
          section_raw: 'Données Brutes (Lecture Seule)',
          section_public: 'Espace Public (Curé)',
          requester: 'Demandeur (Privé)',
          location: 'Localisation (Déclarée)',
          need: 'Besoin (Brut)',
          docs: 'Documents et Photos (Utilisateur)',
          prescription: 'Ordonnance',
          med_photos: 'Photos Médicament',
          open: 'Ouvrir',
          use: 'Utiliser',
          financial: {
            capability: 'Capacité',
            offer: 'Offre',
            family: 'Famille',
            income: 'Revenu',
            delivery: 'Livraison'
          },
          form: {
            title: 'Titre Public *',
            title_ph: 'ex: Père à Alger a besoin d\'Insuline',
            title_help: 'NE JAMAIS mettre le vrai nom.',
            wilaya: 'Wilaya Publique',
            area: 'Zone / Quartier',
            summary: 'Résumé Court (Carte) *',
            summary_ph: 'Résumé court visible sur la carte...',
            desc: 'Description Complète (Détail)',
            desc_ph: 'Histoire complète, détails...',
            gallery: 'Galerie Photo (Affichage)',
            upload_drag: 'Glisser ou cliquer',
            use_proof: 'Utiliser Preuve Utilisateur',
            status: 'Statut & Visibilité',
            urgent_admin: 'Urgence Admin'
          }
        },
      },
      tracking_page: {
        order_prefix: 'COMMANDE #',
        custom_request_title: 'Demande Personnalisée',
        more_items: '+{{count}} autres',
        status_labels: {
          processing: 'En chemin',
          completed: 'Terminée',
          rejected: 'Rejetée',
          default: 'En traitement'
        },
        validation: {
          inputRequired: {
            title: 'Saisie requise',
            desc: 'Veuillez entrer un ID de commande ou un numéro de téléphone'
          },
          invalidFormat: {
            title: 'Format invalide',
            desc: 'Veuillez entrer un ID valide ou un numéro de téléphone.'
          }
        },
        header: {
          title: 'Suivre votre commande',
          desc: 'Vérifiez le statut de votre commande en temps réel.'
        },
        search: {
          placeholder: 'ID Commande ou Téléphone',
          btn: 'Suivre',
          tip: 'Astuce : Utilisez votre numéro pour voir toutes vos commandes.'
        },
        results: {
          back: 'Retour à la liste',
          details: 'Détails',
          found: '{{count}} commandes trouvées',
          noOrders: {
            title: 'Aucune commande trouvée',
            desc: 'Aucune commande correspondant à "{{query}}".'
          }
        }
      },
      verification_page: {
        title: 'Mes Commandes',
        desc: 'Entrez votre numéro pour voir toutes vos demandes.',
        card_title: 'Trouver vos commandes',
        card_desc: 'Nous chercherons les commandes liées à votre numéro.',
        phone_label: 'Numéro de Téléphone',
        btn_searching: 'Recherche...',
        btn_find: 'Trouver Commandes',
        results_count: '{{count}} Commandes Trouvées',
        no_orders: 'Aucune commande {{filter}} trouvée.',
        filters: {
          all: 'toutes',
          active: 'actives',
          completed: 'terminées',
          cancelled: 'annulées'
        },
        toast: {
          phone_required: 'Téléphone Requis',
          phone_desc: 'Veuillez entrer votre numéro.',
          error_title: 'Erreur',
          error_desc: 'Échec de la récupération des commandes.'
        }
      },

      terms: {
        title: 'Conditions Générales',
        subtitle: 'Bienvenue sur Waseet. Voici les règles régissant notre service de connexion et de courtage.',
        acceptance: { title: '1. Acceptation des Conditions', desc: 'En utilisant la plateforme Waseet (site web et services associés), vous acceptez pleinement et sans réserve ces conditions. Si vous n\'êtes pas d\'accord, nous vous invitons à ne pas utiliser nos services.' },
        description: { title: '2. Description du Service', desc: 'Waseet est une <strong>plateforme de courtage et de coordination</strong>. Notre rôle est de connecter des besoins (achats, logistique, aide humanitaire) avec des solutions (vendeurs, livreurs, donateurs, bénévoles).', note: 'Note importante : Waseet facilite la connexion mais n\'est pas le fournisseur direct des produits médicaux, ni un transporteur, ni une banque.' },
        responsibilities: { title: '3. Responsabilités de l\'Utilisateur', desc: 'En tant qu\'utilisateur, vous acceptez de :', items: { 1: 'Fournir des informations exactes et sincères (surtout pour les demandes humanitaires).', 2: 'Ne pas créer de fausses demandes ou induire en erreur les autres utilisateurs.', 3: 'Respecter les autres membres de la communauté (donateurs, chauffeurs, admins).', 4: 'Ne pas utiliser la plateforme pour des activités illégales.' }, warning: 'Tout comportement abusif peut entraîner la suspension immédiate de votre accès.' },
        humanitarian: { title: '4. Avertissement Humanitaire & Santé', items: { alkhayr: '<strong>Alkhayr (Médicaments):</strong> Nous vérifions les demandes, mais nous ne garantissons pas qu\'un donateur sera trouvé. Waseet ne remplace pas une pharmacie ou un avis médical.', blood: '<strong>Don de Sang:</strong> La coordination via Waseet est une aide bénévole pour gagner du temps. En cas d\'urgence vitale, contactez toujours directement les hôpitaux ou la protection civile.', transport: '<strong>Transport Urgent:</strong> Les bénévoles coordonnés par Waseet ne sont pas des ambulanciers professionnels.' } },
        brokerage: { title: '5. Courtage & Change', items: { 1: 'Waseet agit comme courtier. Nous ne détenons pas de fonds comme une banque.', 2: 'Les taux de change affichés sont indicatifs et peuvent varier selon le marché.', 3: 'Waseet n\'est pas responsable des retards causés par des tiers (banques, services de paiement, douanes).' } },
        intermediary: { title: '6. Limites de l\'Intermédiation', desc: 'Nous faisons de notre mieux pour vérifier le sérieux des participants, mais nous ne pouvons garantir la bonne fin de chaque transaction ou promesse de don faite par un tiers. Les accords conclus entre utilisateurs hors de la supervision de Waseet sont de votre responsabilité.' },
        moderation: { title: '7. Modération & Droits d\'Admin', desc: 'Pour la sécurité de tous, les administrateurs Waseet se réservent le droit de :', items: { 1: 'Refuser ou supprimer toute demande jugée suspecte, incomplète ou inappropriée.', 2: 'Modifier le contenu public pour protéger les données sensibles (masquage de noms, etc.).', 3: 'Bannir les utilisateurs ne respectant pas les règles.' } },
        liability: { title: '8. Limitation de Responsabilité', desc: 'Waseet fournit sa plateforme "telle quelle". Nous ne sommes pas responsables des dommages indirects, pertes d\'opportunité ou déceptions liées à une demande d\'aide non satisfaite. L\'utilisation du service est à vos risques, dans les limites du cadre légal applicable.' },
        misc: { title: '9. Divers', items: { privacy: '<strong>Confidentialité:</strong> Vos données sont traitées selon notre <a href="/privacy" class="text-primary hover:underline">Politique de Confidentialité</a>.', changes: '<strong>Changements:</strong> Ces conditions peuvent être mises à jour. L\'utilisation continue du site vaut acceptation des nouvelles règles.', legal: '<strong>Contexte Légal:</strong> Cette plateforme opère principalement en Algérie. Les litiges seront traités avec bon sens et, si nécessaire, selon les juridictions compétentes locales.' } },
        footer: { question: 'Des questions sur ces termes ?', contact: 'Contactez-nous' }
      },
      privacy: {
        title: 'Politique de Confidentialité',
        subtitle: 'Chez Waseet, nous prenons votre vie privée au sérieux. Cette politique explique simplement et honnêtement comment nous traitons vos informations.',
        intro: { title: '1. Introduction', desc: 'Waseet est une plateforme de courtage facilitant les achats, la logistique et l\'aide humanitaire en Algérie. Notre rôle est de connecter des besoins à des solutions. Pour ce faire, nous devons collecter et traiter certaines informations, toujours exclusivement dans le but de rendre le service pour lequel vous nous avez sollicités.' },
        collect: { title: '2. Informations que nous collectons', section_a: 'a) Ce que vous fournissez', items_a: { 1: 'Nom et Prénom', 2: 'Numéro de téléphone (pour vous contacter)', 3: 'Adresse email (optionnel ou pour confirmation)', 4: 'Lieu (Wilaya / Commune) pour la livraison', 5: 'Détails de vos demandes (ordonnances, produits, groupe sanguin)', 6: 'Comptes sociaux (WhatsApp/Telegram) si vous choisissez de les lier' }, section_b: 'b) Collecte Automatique', items_b: { 1: 'Type d\'appareil et navigateur (pour optimiser l\'affichage)', 2: 'Statistiques de visite anonymes (pour améliorer le site)' } },
        use: { title: '3. Comment nous utilisons vos données', desc: 'Nous utilisons vos données uniquement pour :', items: { 1: 'Traiter et exécuter vos commandes ou demandes d\'aide.', 2: 'Coordonner la logistique (livraison, transport).', 3: 'Vous contacter en cas de problème ou pour confirmer des informations.', 4: 'Gérer les urgences (cas Alkhayr ou Don de Sang).', 5: 'Améliorer nos services internes.' }, note: '✋ Nous ne vendons JAMAIS vos données personnelles à des tiers.' },
        visibility: { title: '4. Visibilité & Revue Humaine', desc: 'C\'est un point important de notre plateforme : <strong>chaque demande sensible est revue par un administrateur humain</strong> avant d\'être publiée (surtout pour Alkhayr).', items: { 1: 'Nous ne publions pas automatiquement tout ce que vous envoyez.', 2: 'Les informations sensibles (comme votre nom complet sur une demande publique) sont masquées ou remplacées par des initiales.', 3: 'Seuls les administrateurs Waseet ont accès à toutes vos données brutes.' } },
        sharing: { title: '5. Partage des Données', desc: 'Vos données restent chez Waseet. Elles ne sont partagées que dans des cas strictement opérationnels :', items: { 1: 'Avec un livreur pour acheminer votre colis.', 2: 'Avec un donateur qui accepte de vous aider (après votre accord).', 3: 'Avec les autorités compétentes si la loi l\'exige impérativement.' }, note: 'Nous agissons comme un filtre de sécurité entre les parties pour protéger votre vie privée.' },
        cookies: { title: '6. Cookies, Sécurité & Durée', items: { cookies: '<strong>Cookies:</strong> Nous utilisons des cookies simples pour faire fonctionner le site (ex: garder votre panier actif). Nous n\'utilisons pas de cookies pour vous suivre sur d\'autres sites.', security: '<strong>Sécurité:</strong> Vos données sont stockées sur des serveurs sécurisés. L\'accès est restreint à notre équipe interne. Bien que le "risque zéro" n\'existe pas sur Internet, nous prenons toutes les mesures raisonnables pour protéger vos informations.', duration: '<strong>Durée:</strong> Nous ne gardons pas vos données indéfiniment. Les demandes clôturées ou inactives depuis longtemps peuent être supprimées de nos bases.' } },
        rights: { title: '7. Vos Droits', desc: 'Vous restez propriétaire de vos données. Vous avez le droit de :', items: { 1: 'Demander à voir quelles informations nous avons sur vous.', 2: 'Demander la correction d\'une erreur.', 3: 'Demander la suppression complète de vos données (sauf si une transaction est en cours).' } },
        legal: { title: '8. Position Légale & Mises à jour', items: { intermediary: '<strong>Intermédiaire:</strong> Waseet est une plateforme de mise en relation. Nous coordonnons l\'aide et les services, mais nous ne sommes pas une banque, ni un hôpital.', children: '<strong>Enfants:</strong> Notre service n\'est pas destiné aux enfants. Nous ne collectons pas intentionnellement de données sur des mineurs sans accord parental.', updates: '<strong>Mises à jour:</strong> Cette politique peut évoluer. Toute modification sera publiée ici même.' } },
        footer: { question: 'Des questions sur votre vie privée ?', contact: 'Contactez-nous' }
      },


      alkhayr: {
        title: 'Al-Khayr - Assistance Médicale Humanitaire',
        subtitle: 'Aide médicale sans commission - 100% humanitaire',
        requests: {
          title: 'Demandes Humanitaires',
          subtitle: 'Demandes acceptées avec classification et information de financement',
          classification: 'Classification',
          amount: 'Montant',
          currency: 'Devise',
          severe: 'Sévère',
          medium: 'Moyenne',
          normal: 'Normale',
          statusAccepted: 'Acceptée',
          statusPending: 'En attente',
          statusRejected: 'Rejetée',
          empty: 'Aucune demande acceptée',
          filterAll: 'Toutes',
          filterSevere: 'Sévères',
          filterMedium: 'Moyennes',
          filterNormal: 'Normales'
        },
        nav: {
          local: 'Demande de Médicament Local',
          foreign: 'Médicament de l\'Étranger',
          diaspora: 'Inscription Bénévole',
          myRequests: 'Mes Demandes',
          zeroCommission: 'Politique Zéro Commission',
          faq: 'FAQ'
        },
        local: {
          title: 'Demander un Médicament Disponible Localement',
          subtitle: 'Obtenez de l\'aide pour obtenir un médicament disponible dans le pays',
          form: {
            fullName: 'Nom Complet',
            city: 'Ville / Adresse',
            contact: 'Coordonnées',
            contactPlaceholder: 'WhatsApp ou Telegram',
            medicineName: 'Nom du Médicament ou Traitement',
            medicineNamePlaceholder: 'ex: Paracétamol 500mg',
            prescription: 'Télécharger l\'Ordonnance (optionnel)',
            financialAbility: 'Capacité Financière',
            canPay: 'Oui, je peux payer',
            cannotPay: 'Non, je ne peux pas',
            canPayPartially: 'Partiellement',
            affordAmount: 'Montant que vous pouvez vous permettre',
            needDelivery: 'Besoin de livraison?',
            paidDelivery: 'Payée',
            freeDelivery: 'Gratuite',
            noDelivery: 'Non',
            urgency: 'Niveau de Priorité',
            urgent: 'Urgent',
            normal: 'Normal',
            notes: 'Notes Supplémentaires',
            submit: 'Soumettre la Demande',
            submitting: 'Envoi en cours...'
          },
          success: {
            title: 'Demande Soumise avec Succès',
            desc: 'Nous examinerons votre demande et vous contacterons bientôt'
          }
        },
        foreign: {
          title: 'Demander un Médicament de l\'Étranger',
          subtitle: 'Obtenez de l\'aide pour acheter un médicament non disponible localement',
          form: {
            fullName: 'Nom Complet',
            city: 'Ville',
            contact: 'Coordonnées',
            medicineName: 'Détails du Médicament',
            medicineNamePlaceholder: 'Nom, dosage, quantité',
            prescription: 'Ordonnance / Rapport Médical',
            expectedCountry: 'Pays d\'Origine Prévu',
            expectedCountryPlaceholder: 'ex: France, Allemagne, EAU',
            needType: 'Ce dont vous avez besoin',
            purchaseAndShipping: 'Achat + Expédition',
            shippingOnly: 'Expédition Seulement',
            financialAbility: 'Capacité Financière',
            canPay: 'Oui',
            cannotPay: 'Non',
            canPayPartially: 'Partiellement',
            budget: 'Budget Approximatif',
            urgency: 'Niveau de Priorité',
            urgent: 'Urgent',
            normal: 'Normal',
            notes: 'Notes Supplémentaires',
            submit: 'Soumettre la Demande',
            submitting: 'Envoi en cours...'
          },
          success: {
            title: 'Demande Soumise avec Succès',
            desc: 'Nous trouverons un bénévole pour vous aider'
          }
        },
        diaspora: {
          title: 'Inscription Agent International (Diaspora)',
          subtitle: 'Aidez les patients depuis votre pays actuel',
          form: {
            personalInfo: 'Informations Personnelles',
            fullName: 'Nom Complet',
            country: 'Pays Actuel',
            city: 'Ville',
            contact: 'Coordonnées',
            canOffer: 'Que pouvez-vous offrir? (sélectionnez plusieurs)',
            sendMedicine: 'Envoyer des médicaments',
            buyMedicine: 'Acheter des médicaments',
            shipParcels: 'Expédier des colis',
            financialSupport: 'Soutien financier',
            coordination: 'Coordination',
            financialAbility: 'Capacité Financière',
            canFullyCover: 'Oui - peut couvrir entièrement',
            cannotCover: 'Non - ne peut pas',
            canPartiallyCover: 'Partiellement - peut couvrir en partie',
            maxAmount: 'Montant Maximum',
            extraNotes: 'Notes Supplémentaires',
            extraNotesPlaceholder: 'Pharmacies que vous connaissez, contacts d\'expédition...',
            notifications: 'Préférences de Notification',
            urgentCases: 'Cas urgents',
            fundingNeeded: 'Cas nécessitant un financement',
            importRequests: 'Demandes d\'importation de médicaments',
            agree: 'J\'accepte les conditions (confidentialité + légalité + zéro commission)',
            submit: 'S\'inscrire comme Agent',
            submitting: 'Inscription en cours...'
          },
          success: {
            title: 'Merci de votre inscription!',
            desc: 'Nous examinerons votre candidature et vous contacterons bientôt'
          }
        },
        myRequests: {
          title: 'Mes Demandes Médicales',
          subtitle: 'Suivez l\'état de vos demandes médicales',
          enterContact: 'Entrez vos coordonnées',
          view: 'Voir les Demandes',
          noRequests: 'Aucune demande trouvée',
          type: 'Type',
          status: 'Statut',
          date: 'Date',
          statusPending: 'En attente',
          statusReviewing: 'En révision',
          statusMatched: 'Jumelé',
          statusInProgress: 'En cours',
          statusCompleted: 'Terminé',
          statusCancelled: 'Annulé',
          typeLocal: 'Local',
          typeForeign: 'De l\'Étranger'
        },
        zeroCommission: {
          title: 'Politique Zéro Commission',
          subtitle: 'Notre engagement pour une assistance 100% humanitaire',
          principle1Title: 'Aucune Commission',
          principle1Desc: 'La plateforme ne prend absolument aucune commission sur les demandes humanitaires',
          principle2Title: 'Toutes les Demandes Sont Gratuites',
          principle2Desc: 'Toutes les demandes d\'assistance médicale sont entièrement gratuites',
          principle3Title: 'Transparence Totale',
          principle3Desc: 'Nous protégeons la confidentialité des patients et vérifions toutes les demandes',
          principle4Title: 'Légal & Responsable',
          principle4Desc: 'Nous suivons toutes les règles légales pour l\'importation de médicaments',
          commercial: 'Note : Tout service payant (ex : livraison commerciale) est séparé et ne fait pas partie d\'Al-Khayr'
        },
        faq: {
          title: 'FAQ - Al-Khayr',
          subtitle: 'Comment fonctionne le système d\'assistance médicale',
          q1: 'Qu\'est-ce qu\'Al-Khayr ?',
          a1: 'Al-Khayr est un système d\'assistance médicale humanitaire sans commission. Nous mettons en relation les patients avec des bénévoles pour faciliter l\'accès aux médicaments.',
          q2: 'Y a-t-il des frais ?',
          a2: 'Non, toutes les demandes médicales humanitaires sont entièrement gratuites. Nous ne prenons aucune commission.',
          q3: 'Comment puis-je demander un médicament ?',
          a3: 'Choisissez entre "Demande de Médicament Local" s\'il est disponible dans le pays, ou "Médicament de l\'Étranger" s\'il nécessite une importation.',
          q4: 'Comment puis-je aider en tant que bénévole ?',
          a4: 'Inscrivez-vous sur la page "Inscription Bénévole" et spécifiez l\'aide que vous pouvez offrir.',
          q5: 'Mes informations sont-elles sécurisées ?',
          a5: 'Oui, nous protégeons la confidentialité de tous les patients. Les informations ne sont partagées qu\'avec des bénévoles approuvés.',
          q6: 'Qu\'en est-il des lois sur l\'importation de médicaments ?',
          a6: 'Nous vérifions toutes les demandes et suivons les lois locales et internationales pour l\'importation de médicaments.'
        },
        admin: {
          title: 'Administration Al-Khayr',
          subtitle: 'Gérer les demandes, les jumelages et les bénévoles'
        }
      },
      admin: {
        metrics: {
          pendingOrders: 'Commandes en attente',
          pendingDesc: 'En attente de traitement',
          shipped: 'Expédiées',
          shippedDesc: 'En cours de livraison',
          disputes: 'Litiges',
          disputesDesc: 'Nécessitent une attention',
          newAgents: 'Nouveaux agents',
          newAgentsDesc: 'Derniers 7 jours'
        },
        actions: {
          title: 'Actions rapides',
          refresh: 'Rafraîchir',
          export: 'Exporter les données',
          orders: 'Gérer les commandes',
          agents: 'Examiner les agents',
          referrals: 'Codes de parrainage',
          settings: 'Paramètres',
          imports: 'Demandes d’import',
          exchange: 'Taux de change',
          desc: 'Accéder aux outils et interfaces de gestion.'
        }
      },

      alkhayr_public: {
        tabs: {
          submit: 'Demander de l\'aide',
          search: 'Rechercher',
          donate: 'Faire un don',
          profile: 'Profil'
        },
        filter: {
          title: 'Filtres',
          type: 'Type de demande',
          all: 'Tous',
          local: 'Local',
          foreign: 'Étranger',
          wilaya: 'Wilaya',
          search: 'Recherche',
          placeholder: 'Mots-clés...',
          results: 'Résultats',
          reset: 'Réinitialiser'
        },
        hero: {
          badge: 'Solidarité Médicale',
          title: 'Votre Santé,',
          titleHighlight: 'Notre Priorité',
          desc: 'Une plateforme de solidarité pour faciliter l\'accès aux médicaments et connecter ceux qui sont dans le besoin avec ceux qui peuvent aider.',
          badges: {
            volunteer: 'Aide Bénévole',
            impact: 'Impact Durable'
          }
        },
        empty: {
          title: 'Aucune demande trouvée',
          desc: 'Essayez d\'ajuster vos filtres.'
        },
        card: {
          urgent: 'Urgent',
          local: 'Local',
          foreign: 'Étranger',
          view: 'Voir la demande'
        },
        details: {
          urgent: 'Demande Urgente',
          relative_time: {
            today: 'Aujourd\'hui',
            yesterday: 'Hier',
            days_ago: 'Il y a {{days}} jours'
          },
          no_description: 'Aucune description fournie.',
          photos_title: 'Photos',
          contact_button: 'Contacter Waseet pour Aider',
          ref: 'Réf',
          managed_by: 'Géré par Waseet',
          story: 'L\'Histoire',
          beneficiary: 'Bénéficiaire',
          anonymous: 'Anonyme',
          note_title: 'Note Importante',
          donate_now: 'Faire un don maintenant',
          promo_badge: '❤️ Donnez, Sauvez une Vie',
          years: 'Ans'
        },
        submit: {
          title: 'Demander de l\'Aide',
          desc: 'Remplissez ce formulaire confidentiel. Vos données personnelles ne seront pas affichées publiquement.',
          success: {
            title: 'Demande Enregistrée !',
            desc: 'Elle sera examinée par notre équipe. Seules les informations validées seront rendues publiques.',
            btn_new: 'Soumettre une nouvelle demande'
          },
          tabs: {
            local: 'Local (Algérie)',
            foreign: 'Étranger'
          },
          sections: {
            medication: 'Information Médicament',
            requester: 'Demandeur & Contact',
            location: 'Localisation',
            financial: 'Capacité Financière (Privé)',
            logistics: 'Logistique & Priorité'
          },
          form: {
            medName: 'Nom du Médicament *',
            images: 'Photo(s) (optionnel)',
            imagesHelp: 'Vous pouvez sélectionner plusieurs images.',
            prescription: 'Ordonnance (Requis pour l\'étranger)',
            prescriptionHelp: 'Si l\'ordonnance a plusieurs pages, sélectionnez-les toutes.',
            desc: 'Description / Détails',
            descPlaceholder: 'Décrivez votre besoin...',
            requesterName: 'Nom Complet *',
            requesterPlaceholder: 'Sera affiché uniquement en initiales (ex: Mr. B.)',
            phone: 'Numéro de Téléphone *',
            phonePlaceholder: 'Numéro joignable',
            otherContacts: 'Autres contacts (Optionnel, visible admin)',
            wilaya: 'Wilaya *',
            country: 'Pays Cible *',
            countryPlaceholder: 'Ex: France, Turquie...',
            city: 'Ville / Commune *',
            financialOptions: {
              full: 'Je peux couvrir tous les frais',
              partial: 'Je peux couvrir une partie',
              none: 'Je ne peux rien couvrir',
              delivery: 'J\'ai le produit, je veux juste la livraison'
            },
            amount: 'Montant Approximatif (DA)',
            delivery: 'Avez-vous besoin de livraison ?',
            priority: {
              label: 'Niveau de priorité ressenti',
              help: "Indication pour l'admin. La priorité finale sera déterminée après examen.",
              normal: 'Normal',
              important: 'Important',
              urgent: 'Urgent'
            },
            urgent_checkbox: {
              label: 'Urgence Vitale (Pronostic engagé)',
              desc: 'Cochez cette case UNIQUEMENT si la vie du patient est en danger immédiat.'
            },
            confirm: "Je confirme que les informations fournies sont exactes et que cette demande est authentique. Je comprends que ces informations seront vérifiées par l'équipe avant publication.",
            submitBtn: 'Soumettre la Demande',
            submitting: 'Envoi en cours...'
          },
          errors: {
            required: 'Veuillez remplir tous les champs obligatoires.',
            wilaya: 'La wilaya est requise pour une demande locale.',
            country: 'Le pays est requis pour une demande à l\'étranger.',
            confirm: 'Veuillez confirmer l\'exactitude des informations.',
            submit: 'Une erreur est survenue lors de l\'envoi.'
          },
          toast: {
            success: {
              title: 'Demande envoyée !',
              desc: 'Votre demande a été soumise pour examen.'
            }
          }
        },
        donations: {
          title: 'Espace Dons',
          subtitle: 'Partagez des médicaments, équipements médicaux et aides matérielles avec ceux qui en ont besoin.',
          view_items: 'Voir les Dons',
          propose_item: 'Faire un don',
          available_items: 'Dons Disponibles',
          empty: {
            title: 'Aucun article disponible pour le moment',
            desc: 'Revenez plus tard ou proposez vous-même un don !'
          },
          card: {
            medicine: 'Médicament',
            equipment: 'Équipement',
            other: 'Autre',
            new: 'Neuf',
            used_good: 'Bon état',
            used_fair: 'État moyen',
            qty: 'Qté',
            view_details: 'Voir détails',
            contact: 'Contacter',
            contact_collect: 'Contacter pour récupérer',
            details_title: 'Détails du Don',
            added_on: 'Ajouté le',
            description_title: 'Description',
            no_description: 'Aucune description détaillée.',
            no_images: 'Aucune image disponible'
          },
          form: {
            title: 'Proposer un Article',
            donor_info: 'Vos Coordonnées (Privé - Admin Uniquement)',
            name: 'Nom Complet *',
            phone: 'Téléphone *',
            has_whatsapp: 'J\'ai WhatsApp',
            has_telegram: 'J\'ai Telegram',
            item_details: 'Détails de l\'Article',
            item_name: 'Nom de l\'article *',
            category: 'Catégorie *',
            condition: 'État *',
            location: 'Localisation (Wilaya ou Pays) *',
            description: 'Description (Privé - Admin rédigera la version publique)',
            photos: 'Photos * (Au moins 1)',
            consent: 'Je confirme que cet article est disponible et offert en don. J\'accepte que Waseet partage les détails de l\'article (à l\'exception de mes coordonnées personnelles) sur la plateforme.',
            submit: 'Soumettre l\'Offre',
            success_title: 'Offre Envoyée!',
            success_desc: 'Votre proposition a été envoyée pour validation. Merci pour votre générosité !',
            uploading: 'Envoi en cours...'
          }
        },
        profile: {
          title: 'Mes Demandes',
          desc: 'Vérifiez le statut de vos demandes en entrant votre numéro.',
          dashboard: 'Tableau de bord',
          logout: 'Déconnexion',
          access: 'Accéder',
          phonePlaceholder: '+213 XXX XXX XXX',
          loading: '...',
          no_requests: 'Aucune demande trouvée pour ce numéro.',
          login_error: 'Problème de connexion',
          login_req: 'Numéro requis',
          delete_error: 'Impossible de supprimer',
          delete_success: 'Demande supprimée',
          status: {
            pending: 'En attente',
            approved: 'Validée',
            process: 'En cours',
            fulfilled: 'Terminée',
            rejected: 'Rejetée'
          }
        },
        search_errors: {
          fetch: 'Impossible de charger les demandes'
        },
        contact_dialog: {
          title: 'Contacter Waseet',
          desc: 'Pour protéger la confidentialité des patients, toute communication passe par notre plateforme sécurisée.',
          whatsapp: 'Contacter via WhatsApp',
          facebook: 'Contacter via Facebook',
          instagram: 'Contacter via Instagram'
        }
      },
      classification: {
        severe: 'Critique',
        cancer: 'Cancer',
        surgery: 'Chirurgie',
        medium: 'Moyen',
        diabetes: 'Diabète',
        normal: 'Normal',
        rare: 'Maladie Rare'
      },
      blood: {
        title: 'Don du Sang',
        hero: {
          title: 'Devenir Donneur de Sang',
          subtitle: 'Votre sang peut sauver une vie. Rejoignez notre communauté de héros aujourd\'hui.',
          badge: 'Urgence Humanitaire',
          main_title_1: 'Votre Goutte de Sang',
          main_title_2: 'Sauve une Vie',
          description: 'Rejoignez notre réseau de héros anonymes. Chaque don compte, chaque geste est un espoir pour quelqu\'un dans le besoin.',
          volunteer: '100% Bénévole',
          impact: 'Impact Immédiat'
        },
        profile: {
          access_title: 'Accéder à mon Profil',
          access_desc: 'Entrez votre numéro de téléphone pour gérer vos informations.',
          ph_phone: '+213 XXX XXX XXX',
          btn_access: 'Accéder',
          not_registered: 'Pas encore inscrit ?',
          btn_register: 'Devenir Donneur',
          welcome: 'Bienvenue, {{name}}',
          logout: 'Déconnexion',
          eligible: '✅ Vous êtes éligible pour donner votre sang !',
          eligible_again: '✅ Vous pouvez donner à nouveau !',
          days_remaining: '⏳ Vous pourrez donner à nouveau dans {{count}} jours.',
          personal_info: 'Informations Personnelles',
          edit: 'Modifier',
          save: 'Enregistrer',
          cancel: 'Annuler',
          full_name: 'Nom Complet',
          age: 'Âge',
          phone: 'Téléphone',
          errors: {
            enter_phone: 'Veuillez entrer votre numéro de téléphone',
            update_error: 'Erreur lors de la mise à jour du profil'
          },
          update_success: 'Profil mis à jour avec succès',
          wilaya: 'Wilaya',
          public_visible: 'Visible publiquement',
          emergency_contact: 'Contact d\'Urgence',
          yes: 'Oui',
          no: 'Non',
          history: 'Historique',
          last_donation: 'Date du Dernier Don',
          no_donation: 'Aucun don enregistré',
          update_error: 'Impossible de mettre à jour le profil',
          donor_not_found: 'Donneur non trouvé',
          donor_not_found_desc: 'Aucun profil trouvé avec ce numéro. Veuillez vous inscrire d\'abord.'
        },
        transport: {
          available_count: 'Bénévoles Disponibles ({{count}})',
          loading: 'Chargement...',
          empty: 'Aucun bénévole disponible pour le moment.',
          volunteer_badge: 'Bénévole',
          default_desc: 'Transport d\'urgence gratuit.',
          contact_btn: 'Contacter Waseet',
          dialog: {
            title: 'Coordination Transport',
            desc: 'Pour la sécurité de tous, Waseet coordonne le transport. Contactez-nous pour être mis en relation avec ce bénévole.',
            whatsapp: 'Contacter via WhatsApp',
            facebook: 'Contacter via Facebook'
          },
          title: 'Bénévoles Transport',
          subtitle: 'En cas d\'urgence, chaque minute compte.',
          find: 'Trouver un Transport',
          join: 'Devenir Transporteur',
          privacy_note: '<strong>Note :</strong> Vos détails ne seront <strong>jamais affichés publiquement</strong>. Waseet ne vous contactera qu\'en cas d\'urgence confirmée.',
          register: {
            title: 'Devenir Bénévole Transport',
            subtitle: 'Aidez à sauver des vies en transportant des donneurs gratuitement en cas d\'urgence.',
            full_name: 'Nom Complet *',
            wilaya: 'Wilaya *',
            city: 'Ville / Commune *',
            phone: 'Numéro de Téléphone *',
            other_contacts: 'Autres contacts (Optionnel, visible admin uniquement)',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            additional_info: 'Informations Complémentaires (Optionnel)',
            additional_placeholder: 'Ex: Disponible le soir, ne peut pas quitter la commune...',
            visible_admin: 'Visible uniquement par l\'admin.',
            consent_transport: 'Je confirme que je peux fournir un transport <strong>gratuit</strong> en cas d\'urgence.',
            consent_contact: 'J\'accepte d\'être contacté par Waseet pour coordonner les urgences.',
            btn_submit: 'S\'inscrire comme Bénévole',
            btn_submitting: 'Inscription...',
            success_title: 'Succès',
            success_desc: 'Merci ! Vous êtes inscrit comme bénévole transport.',
            error_title: 'Erreur',
            error_desc: 'Une erreur est survenue.',
            error_consent: 'Veuillez accepter les conditions.'
          },
        },
        search: {
          error_fetch: 'Impossible de charger la liste des donneurs',
          title: 'Filtrer les Donneurs',
          filter_blood: 'Groupe Sanguin',
          filter_wilaya: 'Wilaya',
          filter_name: 'Recherche par Nom',
          placeholder_name: 'Nom du donneur...',
          results_count: '{{count}} résultat(s) trouvé(s)',
          reset: 'Réinitialiser',
          loading: 'Recherche de héros...',
          empty_title: 'Aucun donneur trouvé',
          empty_desc: 'Essayez de changer vos critères de recherche.',
          last_donation: 'Dernier don : {{time}}',
          never_donated: 'Jamais donné',
          days_ago: 'Il y a {{count}} jours',
          months_ago: 'Il y a {{count}} mois',
          years_ago: 'Il y a {{count}} an(s)',
          urgent_badge: '✅ Disponible pour Urgence',
          call: 'Appeler',
          note_title: 'Note Importante',
          note_desc: 'Les informations ci-dessus sont fournies par les donneurs eux-mêmes. Waseet n\'est pas responsable de l\'exactitude des informations. Veuillez traiter les donneurs avec respect et ne les contacter qu\'en cas de besoin réel.'
        },
        register: {
          title: 'Devenir Donneur',
          subtitle: 'Remplissez ce formulaire pour aider ceux dans le besoin.',
          success_title: 'Inscription Réussie !',
          success_desc: 'Merci de rejoindre notre communauté de héros. Votre geste peut sauver des vies.',
          btn_profile: 'Aller à mon profil',
          btn_another: 'Inscrire un autre donneur',
          personal_info: 'Informations Personnelles',
          full_name: 'Nom Complet *',
          phone: 'Numéro de Téléphone *',
          email: 'Email (optionnel)',
          age: 'Âge * (18-65 ans)',
          blood_info: 'Informations Sanguines',
          blood_type: 'Groupe Sanguin *',
          last_donation: 'Dernier Don (optionnel)',
          location: 'Localisation',
          wilaya: 'Wilaya *',
          city: 'Ville *',
          medical_info: 'Conditions Médicales (optionnel)',
          consent_contact: 'J\'accepte d\'être contacté pour des demandes urgentes',
          consent_public: 'J\'accepte que mes infos soient visibles dans la liste publique',
          submit: 'Confirmer l\'Inscription',
          submitting: 'Inscription...',
          eligibility_title: 'Critères d\'Éligibilité Importants',
          criteria_age: '18-65 ans',
          criteria_weight: '+50 kg',
          criteria_health: 'Bonne santé générale',
          criteria_recent: 'Pas de don récent (-3 mois)',
          errors: {
            wilaya: 'La wilaya est requise',
            duplicate_phone: 'Ce numéro de téléphone est déjà inscrit.',
            city: 'La ville est requise',
            reg_error: 'Une erreur est survenue lors de l\'inscription',
            unexpected: 'Une erreur inattendue est survenue'
          }
        },
        tabs: {
          search: 'Trouver un Donneur',
          register: 'Devenir Donneur',
          transport: 'Transport',
          profile: 'Mon Profil'
        },
        filter: {
          all: 'Tous'
        }
      },
      register_agent: {
        hero: {
          title: 'Devenir Agent d\'Importation',
          subtitle: 'Aidez à importer des articles de l\'étranger et gagnez en facilitant la logistique.'
        },
        personal: {
          title: 'Infos Personnelles & Contact',
          name: 'Nom Complet *',
          country: 'Pays Actuel *',
          city: 'Ville *',
          email: 'Adresse Email *',
          phone: 'Numéro de Téléphone (WhatsApp) *',
          telegram: 'Telegram (Optionnel)',
          placeholders: {
            name: 'ex: Karim Benali',
            country: 'ex: France',
            city: 'ex: Paris',
            email: 'karim@exemple.com',
            phone: '+33 6 12 34 56 78',
            telegram: '@nomutilisateur'
          }
        },
        capabilities: {
          title: 'Capacités d\'Importation',
          countries_label: 'Pays depuis lesquels vous expédiez *',
          countries_placeholder: 'ex: France, Allemagne, Espagne (séparés par des virgules)',
          countries_hint: 'Listez tous les pays où vous avez une présence ou pouvez expédier.',
          methods_label: 'Méthodes d\'Expédition Supportées',
          methods: {
            air: 'Fret Aérien',
            sea: 'Fret Maritime',
            hand: 'Valise (Voyageur)'
          },
          frequency_label: 'Fréquence des Envois',
          freq_regular: 'Régulier',
          freq_regular_desc: 'Planning hebdomadaire ou mensuel',
          freq_occasional: 'Occasionnel',
          freq_occasional_desc: 'Selon voyages/demande'
        },
        categories: {
          title: 'Catégories de Produits',
          label: 'Que pouvez-vous transporter ?',
          options: {
            electronics: 'Électronique',
            clothing: 'Vêtements',
            medical: 'Articles Médicaux',
            cosmetics: 'Cosmétiques',
            auto: 'Pièces Auto',
            general: 'Marchandises Générales'
          },
          other_label: 'Autre (veuillez préciser)',
          other_placeholder: 'ex: Machines lourdes, Documents...'
        },
        pricing: {
          title: 'Informations Tarifaires (Optionnel)',
          subtitle: "Cela nous aide à estimer les coûts mais n'est pas contraignant. Le prix final est confirmé manuellement par demande.",
          price_per_kg: 'Prix par KG',
          currency: 'Devise',
          type: 'Type de Tarification',
          types: {
            fixed: 'Taux Fixe',
            negotiable: 'Estimé / Négociable'
          }
        },
        additional: {
          title: 'Notes Supplémentaires',
          placeholder: 'Parlez-nous de votre expérience, contraintes spécifiques, ou autre chose...'
        },
        legal: {
          title: 'Conditions & Accord',
          broker: 'Je comprends que Waseet agit uniquement comme courtier et me connecte à des demandes vérifiées.',
          admin: 'J\'accepte que toute coordination soit soumise à l\'approbation de l\'admin avant partage de mes coordonnées.',
          terms: 'J\'accepte les conditions générales et certifie que les informations fournies sont exactes.',
          submit: 'Soumettre l\'Inscription',
          submitting: 'Envoi en cours...'
        },
        success: {
          title: 'Inscription Reçue',
          desc: 'Votre inscription (ID #{{id}}) a été reçue et est en cours d\'examen. L\'équipe admin vous contactera si votre profil correspond à nos besoins.',
          home_btn: 'Retour à l\'Accueil'
        },
        validation: {
          name: 'Le nom complet est requis',
          country: 'Le pays actuel est requis',
          city: 'La ville est requise',
          phone: 'Le numéro de téléphone est requis',
          email: 'Un email valide est requis',
          countries: 'Listez au moins un pays d\'expédition',
          broker: 'Vous devez reconnaître que Waseet agit uniquement comme courtier',
          admin: 'Vous devez accepter la coordination admin',
          terms: 'Vous devez accepter les conditions',
          title: 'Validation Requise',
          error_title: 'Erreur',
          default_error: 'Échec de l\'envoi'
        }
      },
    },
  },
  ar: {
    translation: {
      yes: 'نعم',
      no: 'لا',
      nav: {
        home: 'الرئيسية',
        order: 'طلب',
        track: 'تتبع الطلب',
        earn: 'اكسب المكافآت',
        verify: 'تحقق',
        about: 'حول',
        contact: 'اتصال',
        exchange: 'الصرف',
        internationalAgent: 'وسيط الخارج',
        agent: {
          requestImport: 'طلب استيراد',
          registerAgent: 'تسجيل كوسيط'
        },
        store: 'المتجر',
        alkhayr_label: 'الخير',
        waseet: 'وسيط'
      },
      cart: {
        title: 'سلة التسوق',
        empty: 'سلة التسوق فارغة',
        start_shopping: 'ابدأ التسوق',
        no_img: 'لا توجد صورة',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        shipping_home: 'شحن (للمنزل)',
        shipping_desk: 'شحن (للمكتب/Stopdesk)',
        shipping_to: 'الشحن إلى:',
        change: 'تغيير',
        select_wilaya: 'اختر الولاية',
        select_address: 'اختر العنوان',
        total: 'المجموع',
        checkout_details: 'تفاصيل الطلب',
        name: 'الاسم الكامل *',
        name_placeholder: 'اسمك',
        phone: 'رقم الهاتف *',
        phone_placeholder: '+213...',
        email: 'البريد الإلكتروني (اختياري)',
        email_placeholder: 'example@email.com',
        additional_contact: 'طرق تواصل إضافية (اختياري)',
        whatsapp: 'واتساب',
        whatsapp_placeholder: 'رقم واتساب (+213...)',
        telegram: 'تيليجرام',
        telegram_placeholder: 'تيليجرام @username',
        place_order: 'تأكيد الطلب',
        processing: 'جاري المعالجة...',
        close: 'إغلاق',
        order_success_title: 'تم الطلب بنجاح',
        order_success_desc: 'لقد استلمنا طلبك.',
        contact_shortly: 'سنتواصل معك قريبا لتأكيد الطلب.',
        keep_ref: 'يرجى الاحتفاظ بأرقام الطلبات هذه للمراجعة.',
        validation: {
          missing_shipping_title: 'معلومات الشحن ناقصة',
          missing_shipping_desc: 'يرجى تقديم عنوان الشحن الخاص بك.',
          missing_name_title: 'الاسم مفقود',
          missing_name_desc: 'يرجى إدخال اسمك الكامل.',
          missing_phone_title: 'رقم الهاتف مفقود',
          missing_phone_desc: 'يرجى إدخال رقم هاتفك الإلزامي.',
          missing_whatsapp_title: 'واتساب مفقود',
          missing_whatsapp_desc: 'يرجى إدخال رقم واتساب أو إلغاء تحديد الخيار.',
          missing_telegram_title: 'تيليجرام مفقود',
          missing_telegram_desc: 'يرجى إدخال اسم مستخدم تيليجرام أو إلغاء تحديد الخيار.'
        },
        order_failed_title: 'فشل الطلب',
        order_failed_desc: 'حدث خطأ ما via يرجى المحاولة مرة أخرى.'
      },
      footer: {
        home: 'الرئيسية',
        order: 'طلب',
        contact: 'اتصال',
        rights: 'جميع الحقوق محفوظة.',
        services: 'خدمات',
        support: 'دعم',
        connect: 'تواصل معنا',
        importRequest: 'طلب استيراد',
        aboutUs: 'من نحن',
        verified_badge: 'طلبات تم التحقق منها • خدمة وساطة',
        privacy: 'الخصوصية',
        terms: 'الشروط',
        cookies: 'ملفات تعريف الارتباط',
        brandDesc: 'وسيط هي منصة وساطة موثوقة تربط الأشخاص بالخدمات اللوجستية، الصرف، والخدمات الموثقة.',
        trackOrder: 'تتبع الطلب',
        exchange: 'الصرف'
      },
      about: {
        hero: {
          title: 'حول وسيط',
          subtitle: 'وسيطك الموثوق للخدمات، يربط بين الاحتياجات المحلية والفرص الدولية.'
        },
        what: {
          title: 'ما هو وسيط؟',
          desc1: 'وسيط هي منصة وساطة خدمات مصممة لتبسيط المعاملات المعقدة للمستخدمين الجزائريين. نحن نعمل كوسيط آمن، نربطك بالمنتجات، فرص صرف العملات، والأسواق الدولية.',
          desc2: 'نحن نعمل وفق نموذج <strong>"الإنسان في الحلقة"</strong>. هذا يعني أن كل طلب تتم مراجعته ومعالجته شخصيًا من قبل فريقنا، مما يضمن الأمان والدقة بدلاً من الاعتماد على الأتمتة العمياء.',
          cards: {
            mediated: 'خدمة بوساطة',
            secure: 'عملية آمنة'
          }
        },
        services: {
          title: 'ماذا نفعل',
          subtitle: 'خدماتنا الأساسية تبسط وصولك إلى الاقتصاد الرقمي.',
          cards: {
            store: { title: 'المتجر والطلب', desc: 'تصفح متجرنا المختار للحصول على المنتجات الأكثر طلبًا. يمكنك الطلب دون إنشاء حساب. تتم مراجعة كل طلب يدويًا لتأكيد التوفر وتفاصيل الشحن حسب ولايتك قبل المعالجة.' },
            exchange: { title: 'صرف العملات', desc: 'قدم طلبات بيع أو شراء العملات القياسية. أسعارنا استرشادية ويحددها مسؤولونا. نعالج هذه الطلبات يدويًا لضمان بيئة تداول آمنة لجميع الأطراف.' },
            import: { title: 'الاستيراد والخدمات اللوجستية', desc: 'ادخل إلى الأسواق الدولية عبر خدمة الاستيراد المخصص (قريبًا). نتعاون أيضًا مع شركاء لوجستيين تم التحقق منهم لإدارة الشحن. يتم التحقق من جميع شراكات الوكلاء يدويًا.' }
          }
        },
        how: {
          title: 'كيف يعمل',
          steps: {
            1: { title: 'الطلب', desc: 'تقوم بتقديم طلب الشراء، الصرف أو الاستيراد عبر نماذجنا البسيطة.' },
            2: { title: 'المراجعة', desc: 'يتحقق فريقنا شخصيًا من التفاصيل، المخزون والأسعار للتأكد من الدقة.' },
            3: { title: 'الاتصال', desc: 'نتصل بك عبر الهاتف أو واتساب للتأكيد ووضع اللمسات الأخيرة.' },
            4: { title: 'التحديث', desc: 'تتبع حالتك في أي وقت باستخدام رقم الطلب في صفحة التتبع الخاصة بنا.' }
          }
        },
        why: {
          title: 'لماذا تختار وسيط؟',
          items: {
            adapted: { title: 'مكيف للجزائر', desc: 'مصمم خصيصًا للسياق والتحديات المحلية.' },
            human: { title: 'تحقق بشري', desc: 'نعطي الأولوية للأمان على السرعة. كل معاملة تخضع للمراقبة.' },
            centralized: { title: 'خدمة مركزية', desc: 'خدمات متعددة (تسوق، صرف، استيراد) في مكان واحد موثوق.' }
          }
        },
        notice: {
          title: 'إشعار شفافية هام',
          desc: 'لضمان الثقة والشفافية الكاملة مع مستخدمينا، نود أن نكون واضحين بشأن ما لسنا عليه:',
          items: {
            1: 'نحن <strong>لسنا بنكًا</strong> أو مؤسسة مالية رسمية.',
            2: 'نحن <strong>لا نعالج المدفوعات تلقائيًا</strong>. يتم التعامل مع جميع الأموال بشكل آمن عبر قنوات يدوية تم التحقق منها.',
            3: 'تقديم الطلب بمثابة حجز، وليس ضمانًا فوريًا. يأتي التأكيد بعد فترة وجيزة من المراجعة.'
          }
        },
        footer: {
          title: 'أسئلة؟',
          desc: 'فريقنا هنا لمساعدتك في تصفح خدماتنا.',
          support: 'الدعم متاح عبر واتساب والبريد الإلكتروني'
        }
      },
      terms: {
        title: 'الشروط والأحكام',
        subtitle: 'مرحبًا بك في وسيط. إليك القواعد التي تنظم خدمة الاتصال والوساطة الخاصة بنا.',
        acceptance: { title: '1. قبول الشروط', desc: 'باستخدام منصة وسيط (الموقع والخدمات المرتبطة)، فإنك تقبل هذه الشروط بالكامل ودون تحفظ. إذا لم تكن موافقًا، ندعوك لعدم استخدام خدماتنا.' },
        description: { title: '2. وصف الخدمة', desc: 'وسيط هي <strong>منصة وساطة وتنسيق</strong>. دورنا هو ربط الاحتياجات (تسوق، لوجستيات، مساعدات إنسانية) بالحلول (بائعين، سائقين، متبرعين، متطوعين).', note: 'ملاحظة مهمة: وسيط يسهل الاتصال ولكنه ليس المورد المباشر للمنتجات الطبية، ولا ناقلًا، ولا بنكًا.' },
        responsibilities: { title: '3. مسؤوليات المستخدم', desc: 'كمستخدم، توافق على:', items: { 1: 'تقديم معلومات دقيقة وصادقة (خاصة للطلبات الإنسانية).', 2: 'عدم إنشاء طلبات وهمية أو تضليل المستخدمين الآخرين.', 3: 'احترام أعضاء المجتمع الآخرين (متبرعين، سائقين، مسؤولين).', 4: 'عدم استخدام المنصة لأنشطة غير قانونية.' }, warning: 'أي سلوك مسيء قد يؤدي إلى تعليق فوري لوصولك.' },
        humanitarian: { title: '4. إخلاء مسؤولية إنساني وصحي', items: { alkhayr: '<strong>الخير (أدوية):</strong> نتحقق من الطلبات، لكننا لا نضمن العثور على متبرع. وسيط لا يحل محل الصيدلية أو الاستشارة الطبية.', blood: '<strong>تبرع بالدم:</strong> التنسيق عبر وسيط هو مساعدة تطوعية لتوفير الوقت. في حالة الطوارئ الحيوية، اتصل دائمًا بالمستشفيات أو الحماية المدنية مباشرة.', transport: '<strong>نقل عاجل:</strong> المتطوعون الذين يتم تنسيقهم بواسطة وسيط ليسوا سائقي سيارات إسعاف محترفين.' } },
        brokerage: { title: '5. الوساطة والصرف', items: { 1: 'وسيط يعمل كوسيط. نحن لا نحتفظ بالأموال مثل البنك.', 2: 'أسعار الصرف المعروضة استرشادية وقد تختلف حسب السوق.', 3: 'وسيط غير مسؤول عن التأخيرات التي تسببها أطراف ثالثة (بنوك، خدمات دفع، جمارك).' } },
        intermediary: { title: '6. حدود الوساطة', desc: 'نحن نبذل قصارى جهدنا للتحقق من جدية المشاركين، لكننا لا يمكننا ضمان إتمام كل معاملة بنجاح أو وعد بالتبرع من قبل طرف ثالث. الاتفاقيات المبرمة بين المستخدمين خارج إشراف وسيط هي مسؤوليتك الخاصة.' },
        moderation: { title: '7. الإشراف وحقوق المسؤول', desc: 'لأمان الجميع، يحتفظ مسؤولو وسيط بالحق في:', items: { 1: 'رفض أو حذف أي طلب يعتبر مشبوهًا، غير مكتمل أو غير لائق.', 2: 'تعديل المحتوى العام لحماية البيانات الحساسة (إخفاء الأسماء، إلخ).', 3: 'حظر المستخدمين الذين لا يحترمون القواعد.' } },
        liability: { title: '8. حدود المسؤولية', desc: 'تقدم وسيط منصتها "كما هي". نحن لسنا مسؤولين عن الأضرار غير المباشرة، ضياع الفرص أو خيبات الأمل المتعلقة بطلب مساعدة لم تتم تلبيتها. استخدام الخدمة يكون على مسؤوليتك الخاصة، ضمن حدود الإطار القانوني المعمول به.' },
        misc: { title: '9. متنوعات', items: { privacy: '<strong>الخصوصية:</strong> تتم معالجة بياناتك وفقًا لـ <a href="/privacy" class="text-primary hover:underline">سياسة الخصوصية</a> الخاصة بنا.', changes: '<strong>التغييرات:</strong> قد يتم تحديث هذه الشروط. الاستخدام المستمر للموقع يعتبر قبولاً للقواعد الجديدة.', legal: '<strong>السياق القانوني:</strong> تعمل هذه المنصة بشكل أساسي في الجزائر. ستتم معالجة النزاعات بحس سليم، وإذا لزم الأمر، وفقًا للاختصاصات القضائية المحلية.' } },
        footer: { question: 'أسئلة حول هذه الشروط؟', contact: 'اتصل بنا' }
      },
      privacy: {
        title: 'سياسة الخصوصية',
        subtitle: 'في وسيط، نأخذ خصوصيتك على محمل الجد. تشرح هذه السياسة ببساطة وصدق كيفية تعاملنا مع معلوماتك.',
        intro: { title: '1. مقدمة', desc: 'وسيط هي منصة وساطة تسهل التسوق، اللوجستيات والمساعدات الإنسانية في الجزائر. دورنا هو ربط الاحتياجات بالحلول. للقيام بذلك، يجب علينا جمع ومعالجة بعض المعلومات، دائمًا وحصريًا لغرض تقديم الخدمة التي طلبتها منا.' },
        collect: { title: '2. المعلومات التي نجمعها', section_a: 'أ) ما تقدمه أنت', items_a: { 1: 'الاسم واللقب', 2: 'رقم الهاتف (للاتصال بك)', 3: 'عنوان البريد الإلكتروني (اختياري أو للتأكيد)', 4: 'الموقع (الولاية / البلدية) للتوصيل', 5: 'تفاصيل طلباتك (وصفات، منتجات، زمرة دم)', 6: 'الحسابات الاجتماعية (واتساب/تيليجرام) إذا اخترت ربطها' }, section_b: 'ب) الجمع التلقائي', items_b: { 1: 'نوع الجهاز والمتصفح (لتحسين العرض)', 2: 'إحصائيات زيارة مجهولة (لتحسين الموقع)' } },
        use: { title: '3. كيف نستخدم بياناتك', desc: 'نستخدم بياناتك فقط لـ:', items: { 1: 'معالجة وتنفيذ طلباتك أو طلبات المساعدة.', 2: 'تنسيق اللوجستيات (التوصيل، النقل).', 3: 'الاتصال بك في حالة وجود مشاكل أو لتأكيد المعلومات.', 4: 'إدارة الطوارئ (حالات الخير أو التبرع بالدم).', 5: 'تحسين خدماتنا الداخلية.' }, note: '✋ نحن لا نبيع بياناتك الشخصية أبدًا لأطراف ثالثة.' },
        visibility: { title: '4. الرؤية والمراجعة البشرية', desc: 'هذه نقطة مهمة في منصتنا: <strong>تتم مراجعة كل طلب حساس بواسطة مسؤول بشري</strong> قبل نشره (خاصة للخير).', items: { 1: 'نحن لا ننشر تلقائيًا كل ما ترسله.', 2: 'المعلومات الحساسة (مثل اسمك الكامل في طلب عام) يتم إخفاؤها أو استبدالها بأحرف أولى.', 3: 'فقط مسؤولو وسيط لديهم الوصول إلى جميع بياناتك الخام.' } },
        sharing: { title: '5. مشاركة البيانات', desc: 'تبقى بياناتك مع وسيط. لا تتم مشاركتها إلا في حالات تشغيلية صارمة:', items: { 1: 'مع سائق توصيل لتوجيه الطرد الخاص بك.', 2: 'مع متبرع يوافق على مساعدتك (بعد موافقتك).', 3: 'مع السلطات المختصة إذا اقتضى القانون ذلك بشكل حتمي.' }, note: 'نحن نعمل كمرشح أمان بين الأطراف لحماية خصوصيتك.' },
        cookies: { title: '6. ملفات تعريف الارتباط، الأمان والمدة', items: { cookies: '<strong>ملفات تعريف الارتباط:</strong> نستخدم ملفات تعريف ارتباط بسيطة لعمل الموقع (مثل: إبقاء سلتك نشطة). لا نستخدم ملفات تعريف الارتباط لتتبعك في مواقع أخرى.', security: '<strong>الأمان:</strong> يتم تخزين بياناتك على خوادم آمنة. الوصول مقيد لفريقنا الداخلي. على الرغم من أن "الخطر الصفري" غير موجود على الإنترنت، فإننا نتخذ جميع التدابير المعقولة لحماية معلوماتك.', duration: '<strong>المدة:</strong> لا نحتفظ ببياناتك إلى الأبد. الطلبات المغلقة أو غير النشطة لفترة طويلة قد يتم حذفها من قواعد بياناتنا.' } },
        rights: { title: '7. حقوقك', desc: 'تظل مالكًا لبياناتك. لديك الحق في:', items: { 1: 'طلب رؤية المعلومات التي لدينا عنك.', 2: 'طلب تصحيح خطأ ما.', 3: 'طلب الحذف الكامل لبياناتك (ما لم تكن هناك معاملة جارية).' } },
        legal: { title: '8. الموقف القانوني والتحديثات', items: { intermediary: '<strong>وسيط:</strong> وسيط هي منصة ربط. نحن ننسق المساعدات والخدمات، لكننا لسنا بنكًا، ولا مستشفى.', children: '<strong>الأطفال:</strong> خدمتنا ليست موجهة للأطفال. نحن لا نجمع عمدًا بيانات عن القصر دون موافقة الوالدين.', updates: '<strong>التحديثات:</strong> قد تتطور هذه السياسة. سيتم نشر أي تعديل هنا مباشرة.' } },
        footer: { question: 'أسئلة حول خصوصيتك؟', contact: 'اتصل بنا' }
      },
      store: {
        notFound: {
          title: 'المتجر غير موجود',
          desc: 'الفئة المطلوبة غير موجودة.'
        },
        noCategories: {
          title: 'لا توجد فئات',
          desc: 'لم يتم إعداد فئات بعد.'
        },
        goHome: 'الرئيسية',
        searchPlaceholder: 'بحث في المنتجات...',
        clear: 'مسح',
        noProducts: {
          title: 'لا توجد منتجات',
          descSearch: 'جرب كلمات بحث مختلفة.',
          descEmpty: 'لا توجد منتجات في هذه الفئة.'
        },
        card: {
          outOfStock: 'مخزون نافد',
          onlyLeft: 'بقي {{count}} فقط',
          noImage: 'لا توجد صورة',
          view: 'عرض',
          addToCart: 'أضف للسلة'
        },
        filter: {
          label: 'تصفية حسب',
          placeholder: 'النوع',
          all: 'الكل'
        },
        toast: {
          error_title: 'خطأ',
          load_data_error: 'فشل تحميل البيانات.',
          load_products_error: 'فشل تحميل المنتجات.'
        },
        suggestion: {
          btn_trigger: 'اقتراح منتج',
          title: 'اقتراح منتج',
          personal_info: 'معلوماتك',
          full_name: 'الاسم الكامل *',
          phone: 'رقم الهاتف *',
          whatsapp_label: 'لدي واتساب',
          whatsapp_placeholder: 'رقم واتساب',
          telegram_label: 'لدي تيليجرام',
          telegram_placeholder: 'معرف تيليجرام / رقم',
          product_details: 'تفاصيل المنتج',
          product_name: 'اسم المنتج *',
          proposed_price: 'السعر المقترح *',
          photos_label: 'صور المنتج * (واحدة على الأقل)',
          upload: 'رفع',
          source_info: 'معلومات المصدر (اختياري)',
          store_name: 'اسم المتجر',
          source_type: 'نوع المصدر',
          source_types: {
            local: 'منتج محلي',
            imported: 'منتج مستورد'
          },
          store_location: 'موقع المتجر',
          notes: 'ملاحظات إضافية',
          notes_placeholder: 'أي تفاصيل إضافية...',
          cancel: 'إلغاء',
          submit: 'إرسال الاقتراح',
          toast: {
            images_uploaded: 'تم رفع الصور',
            images_desc: 'تم رفع {{count}} صور بنجاح.',
            upload_failed: 'فشل الرفع',
            image_required: 'صورة مطلوبة',
            image_required_desc: 'يرجى رفع صورة واحدة على الأقل للمنتج.',
            success_title: 'تم إرسال الاقتراح !',
            success_desc: 'شكرا لك. تم إرسال اقتراحك للمراجعة.',
            failed_title: 'فشل الإرسال'
          }
        }
      },
      product_details: {
        notFound: {
          title: 'المنتج غير موجود',
          desc: 'المنتج المطلوب غير متوفر.'
        },
        backToStore: 'عودة للمتجر',
        back: 'عودة',
        inStock: 'متوفر',
        addToCart: 'أضف للسلة',
        freeShipping: 'شحن مجاني فوق 100$',
        securePayment: 'دفع آمن',
        noDescription: 'لا يوجد وصف.'
      },
      order: {
        header: {
          title: 'طلب جديد',
          subtitle: 'سريع. بسيط. عالمي.'
        },
        product: {
          title: 'معلومات المنتج',
          name: 'اسم المنتج',
          name_ph: 'مثال: iPhone 15 Pro Max',
          url: 'رابط المنتج *',
          url_ph: 'https://amazon.com/product',
          price: 'سعر المنتج *',
          shipping: 'الشحن ($)'
        },
        personal: {
          title: 'معلوماتك',
          name: 'الاسم الكامل *',
          name_ph: 'John Doe',
          contact_method: 'طريقة التواصل *',
          whatsapp: 'واتساب',
          telegram: 'تيليجرام',
          contact_ph_whatsapp: '+213550123456',
          contact_ph_telegram: '@username'
        },
        optional: {
          referral: 'رمز الإحالة (اختياري)',
          referral_ph: 'ABCD1234',
          notes: 'ملاحظات',
          notes_ph: 'اللون، المقاس، تعليمات خاصة...'
        },
        actions: {
          processing: 'جارٍ المعالجة...',
          place: 'تأكيد الطلب',
          add_to_cart: 'أضف للسلة'
        },
        summary: {
          title: 'ملخص الطلب',
          product: 'المنتج',
          shipping: 'الشحن',
          total: 'الإجمالي',
          usd_total: 'الإجمالي (USD)',
          dzd: 'الدينار الجزائري'
        },
        benefits: {
          secure_title: 'دفع آمن',
          secure_desc: 'بياناتك مشفرة',
          fast_title: 'معالجة سريعة',
          fast_desc: 'تأكيد الطلب خلال 24 ساعة',
          track_title: 'تتبع فوري',
          track_desc: 'تابع طلبك في كل مرحلة'
        },
        validation: {
          error: 'خطأ',
          url_required: 'رابط المنتج مطلوب',
          url_invalid: 'يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://',
          price_required: 'يرجى إدخال سعر منتج صحيح',
          name_required: 'الاسم مطلوب',
          contact_required: 'معلومات التواصل مطلوبة',
          phone_invalid: 'يجب أن يكون الرقم بالشكل +213 5/6/7 متبوعًا بـ 8 أرقام (مثال: +213550123456)',
          self_referral: 'لا يمكنك استخدام رمز الإحالة الخاص بك.',
          invalid_referral: 'رمز الإحالة غير موجود. يرجى التحقق من الرمز والمحاولة مرة أخرى.'
        },
        success: {
          title: 'نجاح!',
          desc: 'تم إرسال طلبك بنجاح'
        },
        toast: {
          added: 'تمت الإضافة للسلة',
          added_desc: 'تم إضافة المنتج إلى سلتك'
        },
        error: {
          title: 'خطأ',
          generic: 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.'
        }
      },
      referral: {
        headerTitle: 'اربح مكافآت مع برنامج الإحالة',
        headerDesc: 'شارك رمزك واربح 1000 دج لكل 200$ من المشتريات التي تتم باستخدام رمزك',
        genTitle: 'أنشئ رمز الإحالة الخاص بك',
        genDesc: 'أدخل معلوماتك لإنشاء رمزك الفريد',
        contactMethod: 'طريقة التواصل',
        whatsapp: 'واتساب',
        telegram: 'تيليجرام',
        labels: { whatsapp: 'رقم واتساب', telegram: 'اسم مستخدم تيليجرام' },
        placeholders: { whatsapp: '+213550123456', telegram: '@username' },
        actions: { generate: 'توليد الرمز', generating: 'جاري التوليد...', verify: 'التحقق من الأرباح', checking: 'جاري التحقق...' },
        toast: {
          error: 'خطأ',
          contact_required: 'يرجى إدخال معلومات الاتصال',
          phone_invalid: 'يجب أن يكون التنسيق +213 متبوعًا بـ 8 أرقام',
          existing_title: 'الرمز موجود بالفعل!',
          existing_desc: 'هذا هو رمز الإحالة الخاص بك',
          success_title: 'نجاح!',
          success_desc: 'تم إنشاء رمز الإحالة الخاص بك',
          check_none_title: 'لا يوجد رمز',
          check_none_desc: 'لا يوجد رمز إحالة لهذا الحساب',
          check_found_title: 'تم العثور على إحصائيات!',
          check_found_desc: 'هذه هي إحصائيات الإحالة الخاصة بك',
          copied_title: 'تم النسخ!',
          copied_desc: 'تم نسخ رمز الإحالة إلى الحافظة'
        },
        stats: {
          your_code: 'رمز الإحالة الخاص بك',
          total_collected: 'إجمالي المشتريات',
          rewards: 'المكافآت',
          total_earned: 'إجمالي الأرباح',
          milestone_prefix: 'متبقي',
          milestone_suffix: 'لربح',
          milestone_reward: '1000 دج'
        },
        withdraw: {
          button: 'طلب سحب',
          available_balance: 'الرصيد المتاح',
          ready: 'جاهز للسحب',
          pending_approval: 'في انتظار الموافقة',
          pending_request: 'طلب معلق',
          request_submitted: 'تم إرسال الطلب',
          success_title: 'تم إرسال الطلب!',
          success_desc: 'سيتم معالجة طلب السحب الخاص بك قريبًا'
        },
        generateAnother: 'توليد رمز آخر',
        contactLabel: 'جهة الاتصال: {{type}} - {{value}}',
        howItWorks: {
          title: 'كيف يعمل البرنامج:',
          step1: 'شارك رمزك مع أصدقائك',
          step2: 'يدخلون رمزك عند الشراء',
          step3: 'كل 200$ مشتريات = 1000 دج لك',
          step4: 'بلا حدود! استمر في الربح',
          example: 'مثال: إذا وصلت مشتريات رمزك 600$، تربح 3000 دج'
        },
        self_referral_note: 'لا يمكنك كسب مكافآت باستخدام رمزك الخاص.'
      },
      verify: {
        title: 'التحقق من المشتريات',
        subtitle: 'أدخل واتساب أو تيليجرام لعرض طلباتك',
        cardTitle: 'العثور على طلباتك',
        cardDesc: "سنبحث عن الطلبات المرتبطة بمعلومات الاتصال الخاصة بك",
        contactMethod: 'طريقة التواصل',
        labels: { whatsapp: 'واتساب', telegram: 'تيليجرام', number: 'رقم واتساب', username: 'اسم مستخدم تيليجرام' },
        placeholders: { whatsapp: '+213550123456', telegram: '@username' },
        actions: { verify: 'التحقق من طلباتي', checking: 'جاري التحقق...' },
        toast: {
          error: 'خطأ',
          contact_required: 'يرجى إدخال معلومات الاتصال',
          phone_invalid: 'تنسيق غير صالح',
          no_purchases_title: 'لا توجد مشتريات',
          no_purchases_desc: "لم نعثر على أي طلبات لهذا الحساب",
          fetch_error_title: 'خطأ',
          fetch_error_desc: 'فشل في جلب المشتريات'
        },
        results: { title: 'طلباتك', found: '{{count}} موجودة', order: 'طلب #{{id}}', productLink: 'رابط المنتج' }
      },
      tracking_page: {
        header: {
          title: 'تتبع طلباتك',
          desc: 'أدخل رقم الطلب الذي وصلك عبر البريد الإلكتروني، أو رقم هاتفك لعرض كل السجل.'
        },
        search: {
          placeholder: 'أدخل رقم الطلب أو رقم الهاتف...',
          btn: 'تتبع',
          tip: '💡 يمكنك إدخال تنسيقات قياسية (مثل: 0550... أو +213...)'
        },
        validation: {
          inputRequired: {
            title: 'الإدخال مطلوب',
            desc: 'يرجى إدخال رقم الطلب أو رقم الهاتف'
          },
          invalidFormat: {
            title: 'تنسيق غير صالح',
            desc: 'يرجى إدخال رقم طلب صالح (أرقام) أو رقم هاتفي جزائري.'
          }
        },
        results: {
          found: '{{count}} طلبات موجودة',
          back: '← العودة للقائمة',
          details: 'تفاصيل الطلب',
          noOrders: {
            title: 'لا توجد طلبات',
            desc: 'لم نعثر على أي طلبات تطابق "{{query}}". يرجى التحقق من الرقم والمحاولة مرة أخرى.'
          }
        },
        status_labels: {
          processing: 'في الطريق',
          completed: 'مكتمل',
          rejected: 'مرفوض',
          default: 'قيد المعالجة'
        }
      },

      contact: {
        title: 'تواصل معنا',
        subtitle: 'لديك أسئلة؟ نحن هنا للمساعدة. تواصل عبر أي قناة.',
        whatsapp_title: 'واتساب',
        whatsapp_desc: 'تحدث معنا عبر واتساب',
        telegram_title: 'تيليجرام',
        telegram_desc: 'راسلنا على تيليجرام',
        email_title: 'البريد الإلكتروني',
        email_desc: 'أرسل لنا رسالة بريدية',
        hours_title: 'ساعات العمل',
        hours_desc: 'نحن متاحون خلال الأوقات التالية',
        days: { monfri: 'الاثنين - الجمعة', sat: 'السبت', sun: 'الأحد' },
        times: { monfri: '9:00 - 18:00', sat: '10:00 - 16:00', sun: 'مغلق' }
      },
      home: {
        hero: {
          title_prefix: 'وساطة موثوقة لـ',
          title_highlight: 'اللوجستيات والصرف',
          subtitle: 'وسيط يربطك بالأسواق الدولية وصرف العملات من خلال عملية آمنة تم التحقق منها بشريًا. احترافي، شفاف، ومصمم للجزائر.',
          cta_explore: 'استكشف الخدمات',
          cta_track: 'تتبع الطلب'
        },
        services: {
          title: 'خدماتنا',
          subtitle: 'حلول احترافية لاحتياجاتك الدولية.',
          marketplace: {
            title: 'المتجر',
            desc: 'وصول إلى منتجات مختارة بأسعار شفافة. اطلب بسهولة ودعنا نتولى الخدمات اللوجستية إلى ولايتك.',
            btn: 'تصفح المتجر'
          },
          exchange: {
            title: 'صرف العملات',
            desc: 'وساطة آمنة لمعاملات العملات. نتحقق من كل طلب يدويًا لضمان السلامة والموثوقية.',
            btn: 'أسعار الصرف'
          },
          import: {
            title: 'استيراد مخصص',
            desc: 'اطلب عناصر محددة من الأسواق الدولية. نراجع التوفر ونقدم عرض سعر مؤكد يشمل التوصيل.',
            btn: 'طلب عرض سعر'
          },
          tracking: {
            title: 'تتبع الطلب',
            desc: 'تحديثات حالة في الوقت الفعلي لجميع معاملاتك. ببساطة أدخل رقم الطلب للتحقق من التقدم.',
            btn: 'تتبع الحالة'
          }
        },
        order: {
          header: {
            title: 'طلب جديد',
            subtitle: 'سريع. بسيط. عالمي.'
          },
          product: {
            title: 'معلومات المنتج',
            name: 'اسم المنتج',
            name_ph: 'مثال: آيفون 15 برو ماكس',
            url: 'رابط المنتج *',
            url_ph: 'https://amazon.com/product',
            price: 'سعر المنتج *',
            shipping: 'الشحن ($)'
          },
          personal: {
            title: 'معلوماتك',
            name: 'الاسم الكامل *',
            name_ph: 'فلان الفلاني',
            contact_method: 'طريقة التواصل *',
            whatsapp: 'واتساب',
            telegram: 'تيليجرام',
            contact_ph_whatsapp: '+213550123456',
            contact_ph_telegram: '@username'
          },
          optional: {
            referral: 'رمز الإحالة (اختياري)',
            referral_ph: 'ABCD1234',
            notes: 'ملاحظات',
            notes_ph: 'اللون، المقاس، تعليمات خاصة...'
          },
          actions: {
            processing: 'جاري المعالجة...',
            place: 'تأكيد الطلب',
            add_to_cart: 'أضف للسلة'
          },
          summary: {
            title: 'ملخص الطلب',
            product: 'المنتج',
            shipping: 'الشحن',
            total: 'المجموع',
            usd_total: 'الإجمالي (دولار)',
            dzd: 'دينار جزائري'
          },
          benefits: {
            secure_title: 'دفع آمن',
            secure_desc: 'بياناتك مشفرة',
            fast_title: 'معالجة سريعة',
            fast_desc: 'تأكيد الطلبات خلال 24 ساعة',
            track_title: 'تتبع لحظي',
            track_desc: 'تابع طلبك خطوة بخطوة'
          },
          validation: {
            error: 'خطأ',
            url_required: 'رابط المنتج مطلوب',
            url_invalid: 'يرجى إدخال رابط صالح يبدأ بـ http:// أو https://',
            price_required: 'يرجى إدخال سعر منتج صالح',
            name_required: 'الاسم مطلوب',
            contact_required: 'معلومات الاتصال مطلوبة',
            phone_invalid: 'يجب أن يكون الرقم بصيغة +213 5/6/7 متبوعًا بـ 8 أرقام',
            self_referral: 'لا يمكنك استخدام رمز الإحالة الخاص بك.',
            invalid_referral: 'رمز الإحالة غير موجود.'
          },
          success: {
            title: 'نجاح!',
            desc: 'تم استلام طلبك بنجاح'
          },
          error: {
            title: 'خطأ',
            generic: 'فشل إرسال الطلب. حاول مرة أخرى.'
          }
        },
        how: {
          title: 'كيف تعمل المنصة',
          subtitle: 'عملية بسيطة تم التحقق منها بشريًا لكل طلب.',
          steps: {
            1: { title: 'تقديم الطلب', desc: 'اطلب، اصرف، أو استورد عبر نماذجنا.' },
            2: { title: 'مراجعة الفريق', desc: 'نتحقق يدويًا من التفاصيل والتوفر.' },
            3: { title: 'التأكيد', desc: 'تتلقى الموافقة قبل أي إجراء.' },
            4: { title: 'تتبع التقدم', desc: 'تابع تحديثات الحالة حتى الانتهاء.' }
          },
          manual_note: 'لا يوجد تنفيذ تلقائي. يتم التحقق من كل خطوة بواسطة إنسان.'
        },
        trust: {
          title: 'مبني على العملية، لا الوعود',
          subtitle: 'نعطي الأولوية للسلامة والشفافية والوضوح على السرعة.',
          cards: {
            review: { title: 'مراجعة بشرية', desc: 'تتم مراجعة كل طلب يدويًا. لا معالجة عمياء—نؤكد التفاصيل أولاً.' },
            comms: { title: 'تواصل واضح', desc: 'نتحقق من الأسعار والجداول الزمنية معك قبل التصرف. لن تترك في حيرة أبدًا.' },
            broker: { title: 'دور الوسيط', desc: 'نعمل كوسيط لك، حيث ننسق ونتحقق من المعاملات لنبقي التحكم بين يديك.' },
            local: { title: 'واقع محلي', desc: 'مصمم للجزائر. من الخدمات اللوجستية القائمة على الولاية إلى الفحوصات اليدوية، نحن نعرف السياق.' }
          }
        },
        who: {
          title: 'من يستخدم وسيط؟',
          shoppers: { title: 'المتسوقون الدوليون', desc: 'الأفراد الذين يرغبون في الشراء من الخارج ولكن يحتاجون إلى وسيط موثوق.' },
          exchangers: { title: 'صرافو العملات', desc: 'الأشخاص الذين يحتاجون إلى خدمات صرف آمنة ومنسقة دون مخاطر.' },
          verification: { title: 'الباحثون عن التحقق', desc: 'المستخدمون الذين يفضلون التأكيد البشري على الأنظمة الآلية العمياء.' }
        },
        transparency: {
          title: 'ما ليس هو وسيط',
          items: {
            1: 'وسيط <strong>ليس بنكًا</strong> ولا يحتفظ بالأموال مثل المحفظة.',
            2: 'وسيط <strong>لا ينفذ مدفوعات تلقائية</strong> دون مراجعة.',
            3: 'وسيط <strong>لا يضمن التوفر</strong> فورًا؛ التأكيد مطلوب.'
          }
        },
        ready: {
          title: 'جاهز للبدء؟',
          explore: 'استكشف الخدمات',
          support: 'اتصل بالدعم'
        }
      },




      success: {
        title: 'تم إرسال الطلب بنجاح!',
        processing: 'تم استلام طلبك وهو قيد المعالجة.',
        contactSoon: 'سنتواصل معك قريبًا عبر {{type}} على {{value}}',
        orderId: 'رقم الطلب',
        customerName: 'اسم الزبون',
        totalAmount: 'المبلغ الإجمالي',
        shareWhatsapp: 'شارك عبر واتساب',
        returnHome: 'العودة إلى الرئيسية',
        questions: 'أسئلة؟ زر صفحة ',
        contactPage: 'الاتصال'
      },
      notFound: {
        oops: 'عذرًا! الصفحة غير موجودة',
        returnHome: 'العودة إلى الرئيسية'
      },

      alkhayr: {
        title: 'الخير - المساعدة الطبية الإنسانية',
        subtitle: 'مساعدة طبية بدون عمولات - 100٪ إنساني',
        requests: {
          title: 'الطلبات الإنسانية',
          subtitle: 'طلبات مقبولة مع التصنيف والمبلغ',
          classification: 'التصنيف',
          amount: 'المبلغ',
          currency: 'العملة',
          severe: 'حرج',
          medium: 'متوسط',
          normal: 'عادي',
          statusAccepted: 'مقبول',
          statusPending: 'قيد الانتظار',
          statusRejected: 'مرفوضة',
          empty: 'لا توجد طلبات مقبولة',
          filterAll: 'الكل',
          filterSevere: 'حرجة',
          filterMedium: 'متوسطة',
          filterNormal: 'عادية'
        },
        nav: {
          local: 'طلب دواء محلي',
          foreign: 'طلب دواء من الخارج',
          diaspora: 'تسجيل متطوع',
          myRequests: 'طلباتي',
          zeroCommission: 'سياسة العمولة الصفرية',
          faq: 'الأسئلة الشائعة'
        },
        local: {
          title: 'طلب دواء متوفر محليًا',
          subtitle: 'احصل على مساعدة في الحصول على الدواء المتوفر في البلد',
          form: {
            fullName: 'الاسم الكامل',
            city: 'المدينة / العنوان',
            contact: 'معلومات التواصل',
            contactPlaceholder: 'واتساب أو تيليجرام',
            medicineName: 'اسم الدواء أو العلاج',
            medicineNamePlaceholder: 'مثال: باراسيتامول 500 ملغ',
            prescription: 'تحميل الوصفة الطبية (اختياري)',
            financialAbility: 'القدرة المالية',
            canPay: 'نعم، يمكنني الدفع',
            cannotPay: 'لا، لا أستطيع',
            canPayPartially: 'جزئيًا',
            affordAmount: 'المبلغ الذي يمكنك تحمله',
            needDelivery: 'هل تحتاج التوصيل؟',
            paidDelivery: 'مدفوع',
            freeDelivery: 'مجاني',
            noDelivery: 'لا',
            urgency: 'مستوى الأولوية',
            urgent: 'عاجل',
            normal: 'عادي',
            notes: 'ملاحظات إضافية',
            submit: 'إرسال الطلب',
            submitting: 'جارٍ الإرسال...'
          },
          success: {
            title: 'تم إرسال طلبك بنجاح',
            desc: 'سنراجع طلبك ونتواصل معك قريبًا'
          }
        },
        foreign: {
          title: 'طلب دواء من الخارج',
          subtitle: 'احصل على مساعدة في شراء دواء غير متوفر محليًا',
          form: {
            fullName: 'الاسم الكامل',
            city: 'المدينة',
            contact: 'معلومات التواصل',
            medicineName: 'تفاصيل الدواء',
            medicineNamePlaceholder: 'الاسم، الجرعة، الكمية',
            prescription: 'الوصفة / التقرير الطبي',
            expectedCountry: 'بلد المنشأ المتوقع',
            expectedCountryPlaceholder: 'مثال: فرنسا، ألمانيا، الإمارات',
            needType: 'ما تحتاجه',
            purchaseAndShipping: 'شراء + شحن',
            shippingOnly: 'شحن فقط',
            financialAbility: 'القدرة المالية',
            canPay: 'نعم',
            cannotPay: 'لا',
            canPayPartially: 'جزئيًا',
            budget: 'الميزانية التقريبية',
            urgency: 'مستوى الأولوية',
            urgent: 'عاجل',
            normal: 'عادي',
            notes: 'ملاحظات إضافية',
            submit: 'إرسال الطلب',
            submitting: 'جارٍ الإرسال...'
          },
          success: {
            title: 'تم إرسال طلبك بنجاح',
            desc: 'سنبحث عن متطوع لمساعدتك'
          }
        },
        admin_orders: {
          title: 'إدارة الطلبات',
          subtitle: 'عرض وإدارة جميع طلبات الزبائن.',
          listTitle: 'الطلبات الأخيرة',
          searchPlaceholder: 'بحث برقم الطلب، الزبون، أو المنتج...',
          filterType: {
            all: 'كل الأنواع'
          },
          status: {
            all: 'كل الحالات'
          },
          table: {
            id: 'رقم الطلب',
            type: 'النوع',
            product: 'المنتج / التفاصيل',
            customer: 'الزبون',
            contact: 'التواصل',
            total: 'الإجمالي',
            status: 'الحالة',
            date: 'التاريخ',
            actions: 'إجراءات'
          },
          badges: {
            store: 'طلب متجر',
            custom: 'طلب خاص'
          },
          externalLink: 'رابط خارجي'
        },
        diaspora: {
          title: 'تسجيل متطوع من الخارج',
          subtitle: 'ساعد المرضى من بلدك الحالي',
          form: {
            fullName: 'الاسم الكامل',
            country: 'البلد الحالي',
            city: 'المدينة',
            contact: 'معلومات التواصل',
            canOffer: 'ماذا يمكنك تقديم؟ (اختر متعددة)',
            sendMedicine: 'إرسال دواء',
            buyMedicine: 'شراء دواء',
            shipParcels: 'شحن طرود',
            financialSupport: 'دعم مالي',
            coordination: 'التنسيق والمتابعة',
            financialAbility: 'القدرة المالية',
            canFullyCover: 'نعم - يمكنني التغطية الكاملة',
            cannotCover: 'لا - لا أستطيع',
            canPartiallyCover: 'جزئيًا - يمكنني التغطية الجزئية',
            maxAmount: 'الحد الأقصى للمبلغ',
            extraNotes: 'ملاحظات إضافية',
            extraNotesPlaceholder: 'صيدليات تعرفها، جهات اتصال للشحن...',
            notifications: 'تفضيلات الإشعارات',
            urgentCases: 'حالات عاجلة',
            fundingNeeded: 'حالات تحتاج تمويل',
            importRequests: 'طلبات استيراد دواء',
            agree: 'أوافق على الشروط (الخصوصية + القانون + عمولة صفرية)',
            submit: 'تسجيل كمتطوع',
            submitting: 'جارٍ التسجيل...'
          },
          success: {
            title: 'شكرًا لك على تسجيلك!',
            desc: 'سنراجع طلبك ونتواصل معك قريبًا'
          }
        },
        myRequests: {
          title: 'طلباتي الطبية',
          subtitle: 'تتبع حالة طلباتك الطبية',
          enterContact: 'أدخل معلومات التواصل الخاصة بك',
          view: 'عرض الطلبات',
          noRequests: 'لا توجد طلبات',
          type: 'النوع',
          status: 'الحالة',
          date: 'التاريخ',
          statusPending: 'قيد الانتظار',
          statusReviewing: 'قيد المراجعة',
          statusMatched: 'تم التوافق',
          statusInProgress: 'قيد التنفيذ',
          statusCompleted: 'مكتمل',
          statusCancelled: 'ملغى',
          typeLocal: 'محلي',
          typeForeign: 'من الخارج'
        },
        zeroCommission: {
          title: 'سياسة العمولة الصفرية',
          subtitle: 'التزامنا بالمساعدة الإنسانية 100٪',
          principle1Title: 'لا عمولات على الإطلاق',
          principle1Desc: 'المنصة لا تأخذ أي عمولة من الطلبات الإنسانية',
          principle2Title: 'جميع الطلبات مجانية',
          principle2Desc: 'جميع طلبات المساعدة الطبية مجانية تمامًا',
          principle3Title: 'الشفافية الكاملة',
          principle3Desc: 'نحن نحمي خصوصية المرضى ونتحقق من جميع الطلبات',
          principle4Title: 'قانوني ومسؤول',
          principle4Desc: 'نتبع جميع قواعد استيراد الأدوية القانونية',
          commercial: 'ملاحظة: أي خدمة مدفوعة (مثل التوصيل التجاري) منفصلة وليست جزءًا من "الخير"'
        },
        faq: {
          title: 'الأسئلة الشائعة - الخير',
          subtitle: 'كيف يعمل نظام المساعدة الطبية',
          q1: 'ما هو الخير؟',
          a1: 'الخير هو نظام مساعدة طبية إنسانية بدون أي عمولات. نربط المرضى مع المتطوعين لتسهيل الحصول على الأدوية.',
          q2: 'هل هناك أي رسوم؟',
          a2: 'لا، جميع الطلبات الطبية الإنسانية مجانية تمامًا. لا نأخذ أي عمولة.',
          q3: 'كيف يمكنني طلب دواء؟',
          a3: 'اختر بين "طلب دواء محلي" إذا كان متوفرًا في البلد، أو "طلب دواء من الخارج" إذا كان يحتاج استيراد.',
          q4: 'كيف يمكنني المساعدة كمتطوع؟',
          a4: 'سجل في صفحة "تسجيل متطوع" وحدد ما يمكنك تقديمه من مساعدة.',
          q5: 'هل المعلومات آمنة؟',
          a5: 'نعم، نحمي خصوصية جميع المرضى. المعلومات تُشارك فقط مع المتطوعين المعتمدين.',
          q6: 'ماذا عن قوانين استيراد الأدوية؟',
          a6: 'نتحقق من جميع الطلبات ونتبع القوانين المحلية والدولية لاستيراد الأدوية.'
        }
      },
      admin: {
        metrics: {
          pendingOrders: 'طلبات معلقة',
          pendingDesc: 'بانتظار المعالجة',
          shipped: 'تم شحنها',
          shippedDesc: 'في طريقها',
          disputes: 'نزاعات',
          disputesDesc: 'بحاجة إلى انتباه',
          newAgents: 'وسطاء جدد',
          newAgentsDesc: 'آخر 7 أيام'
        },
        actions: {
          title: 'إجراءات سريعة',
          refresh: 'تحديث',
          export: 'تصدير البيانات',
          orders: 'إدارة الطلبات',
          agents: 'مراجعة الوسطاء',
          referrals: 'رموز الإحالة',
          settings: 'الإعدادات',
          imports: 'طلبات الاستيراد',
          exchange: 'أسعار الصرف',
          desc: 'الوصول إلى أدوات ولوحات الإدارة.'
        }
      },
      exchange: {
        title: 'صرف العملات',
        subtitle: 'سريع. آمن. وموثوق.',
        have: {
          step: '1',
          title: 'لديك',
          currency: 'العملة',
          payment: 'طريقة الدفع',
          amount: 'المبلغ'
        },
        want: {
          step: '2',
          title: 'تريد',
          currency: 'العملة',
          payment: 'طريقة الدفع',
          total: 'الإجمالي'
        },
        form: {
          placeholder: {
            select_currency: 'اختر العملة',
            select_method: 'اختر الطريقة',
            any_method: 'أي طريقة',
            select_wilaya: 'اختر الولاية'
          },
          terms_label: 'أوافق على الشروط والأحكام',
          submit_btn: 'إرسال الطلب',
          submitting: 'جاري الإرسال...'
        },
        location: {
          wilaya: 'الولاية',
          neededBy: 'مطلوب قبل'
        },
        private: {
          title: 'معلومات الاتصال الخاصة',
          subtitle: 'لن يتم مشاركتها علنًا',
          email: 'البريد الإلكتروني',
          phone: 'رقم الهاتف',
          whatsapp: 'رقم واتساب',
          telegram: 'تيليجرام'
        },
        validation: {
          terms: 'يجب قبول الشروط',
          required: 'جميع الحقول مطلوبة',
          amount: 'المبلغ غير صالح',
          date: 'التاريخ مطلوب',
          email: 'البريد الإلكتروني مطلوب',
          phone: 'رقم الهاتف مطلوب',
          submit_error: 'حدث خطأ أثناء الإرسال'
        },
        success: {
          title: 'تم بنجاح!',
          desc: 'تم استلام طلبك',
          id_prefix: 'رقم الطلب:'
        }
      },
      exchange_sidebar: {
        howTitle: 'كيف تعمل',
        step1: 'اختر النوع (شراء / بيع).',
        step2: 'حدد العملات وأدخل الكمية.',
        step3: 'أدخل طرق الدفع الخاصة بك.',
        step4: 'أدخل تفاصيل الاتصال وأرفق الملفات إذا لزم الأمر.',
        step5: 'وافق على الشروط ثم أرسل.',
        securityTitle: 'الأمان والنصائح',
        securityBody: 'نراجع كل طلب يدويًا. لا تشارك كلمات المرور أو الأكواد الحساسة. قد تستغرق المراجعة حتى 24 ساعة.'
      },
      alkhayr_public: {
        tabs: {
          submit: 'تقديم طلب',
          search: 'بحث',
          donate: 'تبرع',
          profile: 'الملف الشخصي'
        },
        filter: {
          title: 'تصفية',
          type: 'نوع الطلب',
          all: 'الكل',
          local: 'محلي',
          foreign: 'خارج البلاد',
          wilaya: 'الولاية',
          search: 'بحث',
          placeholder: 'كلمات دلالية...',
          results: 'النتائج',
          reset: 'إعادة تعيين'
        },
        card: {
          local: 'محلي',
          foreign: 'خارج البلاد',
          urgent: 'عاجل',
          view: 'عرض الطلب'
        },
        details: {
          urgent: 'طلب عاجل',
          relative_time: {
            today: 'اليوم',
            yesterday: 'أمس',
            days_ago: 'منذ {{days}} أيام'
          },
          no_description: 'لا يوجد وصف.',
          photos_title: 'الصور',
          contact_button: 'تواصل مع وسيط للمساعدة',
          ref: 'مرجع',
          managed_by: 'بإدارة وسيط',
          story: 'القصة',
          beneficiary: 'المستفيد',
          anonymous: 'مجهول',
          note_title: 'ملاحظة هامة',
          donate_now: 'تبرع الآن',
          promo_badge: '❤️ تبرع، أنقذ حياة',
          years: 'سنة'
        },
        hero: {
          badge: 'تضامن طبي',
          title: 'صحتك،',
          titleHighlight: 'أولويتنا',
          desc: 'منصة تضامنية لتسهيل الوصول للأدوية وربط المحتاجين بمن يستطيع المساعدة.',
          badges: {
            volunteer: 'مساعدة تطوعية',
            impact: 'أثر مستدام'
          }
        },
        empty: {
          title: 'لم يتم العثور على طلبات',
          desc: 'حاول تعديل خيارات التصفية.'
        },
        submit: {
          title: 'طلب المساعدة',
          desc: 'املأ هذا النموذج السري. لن يتم عرض بياناتك الشخصية للعامة.',
          success: {
            title: 'تم حفظ الطلب!',
            desc: 'سيتم مراجعته من قبل فريقنا. سيتم نشر المعلومات المؤكدة فقط.',
            btn_new: 'تقديم طلب جديد'
          },
          tabs: {
            local: 'محلي (الجزائر)',
            foreign: 'خارج البلاد'
          },
          sections: {
            medication: 'معلومات الدواء',
            requester: 'مقدم الطلب والاتصال',
            location: 'الموقع',
            financial: 'القدرة المالية (خاص)',
            logistics: 'اللوجستيات والأولوية'
          },
          form: {
            medName: 'اسم الدواء *',
            images: 'صور (اختياري)',
            imagesHelp: 'يمكنك اختيار عدة صور.',
            prescription: 'الوصفة الطبية (مطلوبة للخارج)',
            prescriptionHelp: 'إذا كانت الوصفة من عدة صفحات، اخترها كلها.',
            desc: 'الوصف / التفاصيل',
            descPlaceholder: 'صف احتياجك...',
            requesterName: 'الاسم الكامل *',
            requesterPlaceholder: 'سيظهر فقط كأحرف أولى (مثل السيد ب.)',
            phone: 'رقم الهاتف *',
            phonePlaceholder: 'رقم يمكن الاتصال به',
            otherContacts: 'جهات اتصال أخرى (اختياري، مرئي للمسؤول)',
            whatsapp: 'واتساب',
            telegram: 'تيليجرام',
            wilaya: 'الولاية *',
            country: 'البلد المستهدف *',
            countryPlaceholder: 'مثال: فرنسا، تركيا...',
            city: 'المدينة / البلدية *',
            financialOptions: {
              full: 'يمكنني تغطية جميع التكاليف',
              partial: 'يمكنني تغطية جزء',
              none: 'لا يمكنني تغطية أي شيء',
              delivery: 'لدي المنتج، أريد فقط التوصيل'
            },
            amount: 'المبلغ التقريبي (دج)',
            delivery: 'هل تحتاج إلى توصيل؟',
            priority: {
              label: 'مستوى الأولوية المتصور',
              help: "إشارة للمسؤول. سيتم تحديد الأولوية النهائية بعد المراجعة.",
              normal: 'عادي',
              important: 'مهم',
              urgent: 'عاجل'
            },
            urgent_checkbox: {
              label: 'حالة طارئة حرجة (مهدد للحياة)',
              desc: 'حدد هذا المربع فقط إذا كانت حياة المريض في خطر فوري.'
            },
            confirm: "أؤكد أن المعلومات المقدمة دقيقة وأن هذا الطلب حقيقي. أفهم أن الفريق سيتحقق من هذه المعلومات قبل النشر.",
            submitBtn: 'إرسال الطلب',
            submitting: 'جاري الإرسال...'
          },
          errors: {
            required: 'يرجى ملء جميع الحقول المطلوبة.',
            wilaya: 'الولاية مطلوبة للطلب المحلي.',
            country: 'البلد مطلوب للطلب الخارجي.',
            confirm: 'يرجى تأكيد صحة المعلومات.',
            submit: 'حدث خطأ أثناء الإرسال.'
          },
          toast: {
            success: {
              title: 'تم إرسال الطلب!',
              desc: 'تم تقديم طلبك للمراجعة.'
            }
          }
        },
        profile: {
          title: 'طلباتي',
          desc: 'تحقق من حالة طلباتك عن طريق إدخال رقم هاتفك.',
          dashboard: 'لوحة التحكم',
          logout: 'تسجيل خروج',
          access: 'دخول',
          phonePlaceholder: '+213 XXX XXX XXX',
          loading: '...',
          no_requests: 'لا توجد طلبات لهذا الرقم.',
          login_error: 'مشكلة في الاتصال',
          login_req: 'الرقم مطلوب',
          delete_error: 'تعذر الحذف',
          delete_success: 'تم حذف الطلب',
          status: {
            pending: 'قيد الانتظار',
            approved: 'تم التحقق',
            process: 'قيد المعالجة',
            fulfilled: 'مكتملة',
            rejected: 'مرفوضة'
          }
        },
        search_errors: {
          fetch: 'تعذر تحميل الطلبات'
        },
        contact_dialog: {
          title: 'تواصل مع وسيط',
          desc: 'لحماية خصوصية المرضى، تتم جميع الاتصالات عبر منصتنا الآمنة.',
          whatsapp: 'تواصل عبر واتساب',
          facebook: 'تواصل عبر فيسبوك',
          instagram: 'تواصل عبر انستجرام'
        },
        donations: {
          title: 'فضاء التبرعات العينية',
          subtitle: 'شارك الأدوية، والمعدات الطبية والمساعدات العينية مع المحتاجين.',
          view_items: 'التبرعات',
          propose_item: 'ساعدنا بتبرع',
          available_items: 'المواد المتاحة',
          empty: {
            title: 'لا توجد مواد متاحة حاليا',
            desc: 'عد لاحقا أو اعرض تبرعا بنفسك!'
          },
          card: {
            medicine: 'دواء',
            equipment: 'معدات',
            other: 'أخرى',
            new: 'جديد',
            used_good: 'حالة جيدة',
            used_fair: 'حالة متوسطة',
            qty: 'الكمية',
            view_details: 'عرض التفاصيل',
            contact: 'تواصل',
            contact_collect: 'تواصل للاستلام',
            details_title: 'تفاصيل التبرع',
            added_on: 'أضيف في',
            description_title: 'الوصف',
            no_description: 'الوصف متاح عند الطلب.',
            no_images: 'لا توجد صور'
          },
          form: {
            title: 'ساعدنا بتبرع',
            donor_info: 'معلومات الاتصال (خاص - للمسؤول فقط)',
            name: 'الاسم الكامل *',
            phone: 'رقم الهاتف *',
            has_whatsapp: 'لدي واتساب',
            has_telegram: 'لدي تيليجرام',
            item_details: 'تفاصيل المادة',
            item_name: 'اسم المادة *',
            category: 'الفئة *',
            condition: 'الحالة *',
            location: 'الموقع (ولاية أو بلد) *',
            description: 'الوصف (خاص - المسؤول سيكتب النسخة العامة)',
            photos: 'صور * (واحدة على الأقل)',
            consent: 'أؤكد أن هذه المادة متاحة للتبرع وأوافق على مشاركة تفاصيل المادة (باستثناء وسيلة الاتصال الخاصة بي) على المنصة.',
            submit: 'إرسال العرض',
            success_title: 'تم إرسال العرض!',
            success_desc: 'تم إرسال عرضك للمراجعة. شكرا لكرمك!',
            uploading: 'جاري الرفع...'
          }
        }
      },
      classification: {
        severe: 'حرج',
        cancer: 'سرطان',
        surgery: 'جراحة',
        medium: 'متوسط',
        diabetes: 'سكري',
        normal: 'عادي',
        rare: 'مرض نادر'
      },
      blood: {
        title: 'تبرع بالدم',
        hero: {
          badge: 'تضامن طبي',
          main_title_1: 'تبرع بدمك،',
          main_title_2: 'أنقذ حياة',
          description: 'انضم لشبكة المتبرعين المتطوعين. يمكن لمبادرتك أن تصنع الفرق بين الحياة والموت لشخص محتاج.',
          volunteer: 'كن متطوعًا',
          impact: 'تأثير مباشر'
        },
        tabs: {
          search: 'البحث عن متبرع',
          register: 'التسجيل كمتبرع',
          transport: 'النقل',
          profile: 'ملفي الشخصي'
        },
        search: {
          title: 'تصفية المتبرعين',
          filter_blood: 'فصيلة الدم',
          filter_wilaya: 'الولاية',
          filter_name: 'البحث بالاسم',
          placeholder_name: 'اسم المتبرع...',
          results_count: '{{count}} نتيجة',
          reset: 'إعادة تعيين',
          loading: 'جاري البحث...',
          empty_title: 'لم يتم العثور على متبرعين',
          empty_desc: 'حاول تغيير معايير البحث.',
          last_donation: 'آخر تبرع: {{time}}',
          never_donated: 'لم يتبرع من قبل',
          days_ago: 'منذ {{count}} أيام',
          months_ago: 'منذ {{count}} أشهر',
          years_ago: 'منذ {{count}} سنوات',
          urgent_badge: '✅ متاح للطوارئ',
          call: 'اتصال',
          note_title: 'ملاحظة هامة',
          note_desc: 'المعلومات مقدمة من المتبرعين أنفسهم. وسيط غير مسؤول عن صحتها. يرجى التواصل فقط للضرورة القصوى.'
        },
        register: {
          title: 'كن متبرعًا',
          subtitle: 'املأ الاستمارة لمساعدة المحتاجين.',
          success_title: 'تم التسجيل بنجاح!',
          success_desc: 'شكرًا لانضمامك لمجتمع الأبطال. مبادرتك قد تنقذ أرواحًا.',
          btn_profile: 'عرض ملفي',
          btn_another: 'تسجيل متبرع آخر',
          personal_info: 'المعلومات الشخصية',
          full_name: 'الاسم الكامل *',
          phone: 'رقم الهاتف *',
          email: 'البريد الإلكتروني (اختياري)',
          age: 'العمر * (18-65 سنة)',
          blood_info: 'معلومات الدم',
          blood_type: 'فصيلة الدم *',
          last_donation: 'آخر تبرع (اختياري)',
          location: 'الموقع',
          wilaya: 'الولاية *',
          city: 'البلدية *',
          medical_info: 'الحالة الصحية (اختياري)',
          consent_contact: 'أوافق على التواصل معي للطوارئ',
          consent_public: 'أوافق على ظهور بياناتي في القائمة العامة',
          submit: 'تأكيد التسجيل',
          submitting: 'جاري التسجيل...',
          eligibility_title: 'معايير الأهلية',
          criteria_age: '18-65 سنة',
          criteria_weight: '+50 كغ',
          criteria_health: 'صحة جيدة',
          criteria_recent: 'لا تبرع حديث (-3 أشهر)',
          errors: {
            wilaya: 'الولاية مطلوبة',
            city: 'البلدية مطلوبة',
            reg_error: 'خطأ في التسجيل',
            unexpected: 'خطأ غير متوقع'
          }
        },
        transport: {
          available_count: 'متطوعين متاحين ({{count}})',
          loading: 'جاري التحميل...',
          empty: 'لا يوجد متطوعون متاحون حاليا.',
          volunteer_badge: 'نقل تطوعي',
          contact_btn: 'تواصل',
          title: 'متطوعو النقل',
          subtitle: 'في حالات الطوارئ، كل دقيقة تهم.',
          find: 'العثور على وسيلة نقل',
          join: 'كن سائقاً متطوعاً',
          privacy_note: 'ملاحظة: تفاصيلك لن تظهر للعلن أبدًا.',
          register: {
            title: 'التسجيل كمتطوع نقل',
            subtitle: 'ساهم في إنقاذ الأرواح بنقل المتبرعين مجانًا.',
            full_name: 'الاسم الكامل *',
            wilaya: 'الولاية *',
            city: 'البلدية *',
            phone: 'رقم الهاتف *',
            other_contacts: 'جهات اتصال أخرى (للإدارة فقط)',
            whatsapp: 'واتساب',
            telegram: 'تيليجرام',
            additional_info: 'معلومات إضافية',
            additional_placeholder: 'مثال: متاح في المساء...',
            visible_admin: 'مرئي للإدارة فقط',
            consent_transport: 'أؤكد قدرتي على النقل المجاني في الطوارئ.',
            consent_contact: 'أوافق على التواصل معي من قبل وسيط.',
            btn_submit: 'التسجيل كمتطوع',
            btn_submitting: 'جاري التسجيل...',
            success_title: 'نجاح',
            success_desc: 'شكرًا! تم تسجيلك كمتطوع نقل.',
            error_title: 'خطأ',
            error_desc: 'حدث خطأ ما.',
            error_consent: 'يرجى الموافقة على الشروط.'
          }
        },
        profile: {
          access_title: 'الوصول للملف الشخصي',
          access_desc: 'أدخل رقم هاتفك لإدارة ملفك الشخصي كمتبرع أو متطوع نقل.',
          ph_phone: 'رقم هاتفك',
          btn_access: 'دخول',
          not_registered: 'لست مسجلاً؟',
          btn_register: 'سجل الآن'
        }
      },
      request_import: {
        blocked: {
          title: 'غير متاح حالياً',
          desc: 'ستعود هذه الخاصية قريباً. اضغط موافق للعودة.',
          btn: 'موافق'
        },
        title: 'طلب استيراد',
        subtitle: 'قدم طلب استيراد دولي للمراجعة.',
        sections: {
          contact: 'معلومات الاتصال',
          origin: 'المصدر',
          product: 'المنتج',
          options: 'خيارات',
          confirmation: 'التأكيد',
          tips: 'نصائح'
        },
        contact: {
          name: 'اسم العميل',
          name_ph: 'اختياري',
          method: 'طريقة الاتصال',
          value: 'قيمة الاتصال *',
          value_ph: '+2135XXXXXXXX'
        },
        origin: {
          country: 'بلد المنشأ *',
          country_ph: 'فرنسا',
          city: 'المدينة',
          city_ph: 'باريس'
        },
        product: {
          desc: 'الوصف *',
          desc_ph: 'الماركة / الموديل / الحجم',
          links: 'رابط (اختياري)',
          links_ph: 'رابط واحد في كل سطر',
          currency: 'العملة',
          value: 'القيمة *',
          value_ph: '129.99',
          quantity: 'الكمية *'
        },
        options: {
          priority: 'أولوية الشحن',
          priorities: {
            normal: 'عادي',
            express: 'سريع'
          },
          delivery: 'طريقة الاستلام',
          deliveries: {
            home: 'توصيل للمنزل',
            pickup: 'استلام من المكتب'
          }
        },
        confirmation: {
          terms: 'أوافق على رسوم الخدمة والشروط *',
          submit: 'إرسال الطلب',
          submitting: 'جاري الإرسال...',
          modal: {
            title: 'تأكيد الطلب',
            cancel: 'إلغاء',
            confirm: 'تأكيد وإرسال'
          }
        },
        tips: {
          title: 'نصائح',
          t1: 'قدم تفاصيل واضحة عن المنتج لتسريع التحقق.',
          t2: 'واتساب يوفر تحديثات أسرع من البريد الإلكتروني.',
          t3: 'الشحن السريع يزيد التكلفة؛ اختره فقط للضرورة.'
        },
        validation: {
          contact: 'طريقة الاتصال مطلوبة',
          country: 'بلد المنشأ مطلوب',
          desc: 'وصف المنتج مطلوب',
          value: 'قيمة المنتج مطلوبة',
          quantity: 'الكمية يجب أن تكون 1 على الأقل',
          terms: 'يجب الموافقة على الشروط',
          title: 'تنبيه',
          sent: 'تم إرسال الطلب',
          sent_desc_id: 'تم استلام طلبك رقم #{{id}}.',
          error: 'خطأ',
          wait: 'يرجى الانتظار',
          wait_desc: 'يمكنك المحاولة مرة أخرى بعد دقيقة'
        }
      },
      register_agent: {
        hero: {
          title: 'كن وسيطًا للاستيراد',
          subtitle: 'ساعد في استيراد السلع من الخارج واكسب المال من خلال تسهيل الخدمات اللوجستية.'
        },
        personal: {
          title: 'المعلومات الشخصية والاتصال',
          name: 'الاسم الكامل *',
          country: 'البلد الحالي *',
          city: 'المدينة *',
          email: 'البريد الإلكتروني *',
          phone: 'رقم الهاتف (واتساب) *',
          telegram: 'تيليجرام (اختياري)',
          placeholders: {
            name: 'مثال: كريم بن علي',
            country: 'مثال: فرنسا',
            city: 'مثال: باريس',
            email: 'karim@example.com',
            phone: '+33 6 12 34 56 78',
            telegram: '@username'
          }
        },
        capabilities: {
          title: 'قدرات الاستيراد',
          countries_label: 'البلدان التي تشحن منها *',
          countries_placeholder: 'مثال: فرنسا، ألمانيا، إسبانيا (مفصولة بفواصل)',
          countries_hint: 'اذكر جميع البلدان التي لديك تواجد فيها أو يمكنك الشحن منها.',
          methods_label: 'طرق الشحن المدعومة',
          methods_placeholder: 'أدخل طرق الشحن التي تدعمها',
          methods: {
            air: 'شحن جوي',
            sea: 'شحن بحري',
            hand: 'حقيبة (مسافر)'
          },
          frequency_label: 'تكرار الشحنات',
          freq_regular: 'منتظم',
          freq_regular_desc: 'جدول أسبوعي أو شهري',
          freq_occasional: 'عرضي',
          freq_occasional_desc: 'حسب الرحلات/الطلب'
        },
        categories: {
          title: 'فئات المنتجات',
          label: 'ماذا يمكنك أن تنقل؟',
          options: {
            electronics: 'إلكترونيات',
            clothing: 'ملابس',
            medical: 'مستلزمات طبية',
            cosmetics: 'مستحضرات تجميل',
            auto: 'قطع غيار سيارات',
            general: 'بضائع عامة'
          },
          other_label: 'أخرى (يرجى التحديد)',
          other_placeholder: 'مثال: معدات ثقيلة، وثائق...'
        },
        pricing: {
          title: 'معلومات التسعير (اختياري)',
          subtitle: "يساعدنا هذا في تقدير التكاليف ولكنه غير ملزم. يتم تأكيد السعر النهائي يدويًا لكل طلب.",
          price_per_kg: 'السعر لكل كغ',
          currency: 'العملة',
          type: 'نوع التسعير',
          types: {
            fixed: 'سعر ثابت',
            negotiable: 'تقديري / قابل للتفاوض'
          }
        },
        additional: {
          title: 'ملاحظات إضافية',
          placeholder: 'خبرنا عن تجربتك، قيود معينة، أو أي شيء آخر...'
        },
        legal: {
          title: 'الشروط والاتفاقية',
          broker: 'أفهم أن وسيط تكتفي بالوساطة وتربطني بطلبات تم التحقق منها.',
          admin: 'أوافق على أن يخضع كل تنسيق لموافقة المسؤول قبل مشاركة تفاصيل الاتصال الخاصة بي.',
          terms: 'أوافق على الشروط والأحكام وأشهد بدقة المعلومات المقدمة.',
          submit: 'إرسال التسجيل',
          submitting: 'جاري الإرسال...'
        },
        success: {
          title: 'تم استلام التسجيل',
          desc: 'تم استلام طلبك (ID #{{id}}) وهو قيد المراجعة. سيتصل بك فريق الإدارة إذا كان ملفك الشخصي يتوافق مع خدماتنا.',
          home_btn: 'العودة للرئيسية'
        },
        validation: {
          name: 'الاسم الكامل مطلوب',
          country: 'البلد الحالي مطلوب',
          city: 'المدينة مطلوبة',
          phone: 'رقم الهاتف مطلوب',
          email: 'بريد إلكتروني صالح مطلوب',
          countries: 'اذكر بلد شحن واحد على الأقل',
          broker: 'يجب أن تقر بأن وسيط تعمل كوسيط فقط',
          admin: 'يجب قبول التنسيق الإداري',
          terms: 'يجب قبول الشروط',
          title: 'التحقق مطلوب',
          error_title: 'خطأ',
          default_error: 'فشل الإرسال'
        }
      },
      admin_alkhayr: {
        title: 'إدارة الخير',
        subtitle: 'رقابة صارمة على المحتوى العام',
        stats: {
          pending: 'قيد الانتظار',
          online: 'منشور (عام)',
          total: 'إجمالي الطلبات'
        },
        tabs: {
          pending: 'قيد الانتظار',
          online: 'منشور',
          handled: 'تمت المعالجة',
          rejected: 'مرفوض',
          all: 'الكل'
        },
        card: {
          untitled: '(بدون عنوان عام)',
          raw: 'المصدر: {{val}}'
        },
        modal: {
          status: {
            pending: 'قيد الانتظار',
            online: 'منشور',
            handled: 'تمت المعالجة',
            rejected: 'مرفوض'
          },
          actions: {
            cancel: 'إلغاء',
            save: 'حفظ التغييرات'
          },
          title: 'إدارة الطلب #{{id}}',
          section_raw: 'البيانات الخام (للقراءة فقط)',
          section_public: 'المساحة العامة (مدارة)',
          requester: 'مقدم الطلب (خاص)',
          location: 'الموقع (المصرح به)',
          need: 'الاحتياج (الخام)',
          docs: 'وثائق وصور (المستخدم)',
          prescription: 'الوصفة الطبية',
          med_photos: 'صور الدواء',
          open: 'فتح',
          use: 'استخدام',
          financial: {
            capability: 'القدرة',
            offer: 'العرض',
            family: 'العائلة',
            income: 'الدخل',
            delivery: 'التوصيل'
          },
          form: {
            title: 'العنوان العام *',
            title_ph: "مثال: أب في الجزائر يحتاج أنسولين",
            title_help: 'لا تضع الاسم الحقيقي أبداً.',
            wilaya: 'الولاية العامة',
            area: 'الحي / المنطقة',
            summary: 'ملخص قصير (للبطاقة) *',
            summary_ph: 'ملخص قصير يظهر على البطاقة...',
            desc: 'الوصف الكامل (التفاصيل)',
            desc_ph: 'القصة الكاملة، التفاصيل...',
            gallery: 'معرض الصور (للعرض)',
            upload_drag: 'اسحب أو انقر',
            use_proof: 'استخدام إثبات المستخدم',
            status: 'الحالة والظهور',
            urgent_admin: 'أولوية الإدارة'
          }
        }
      }
    }
  }
} as const;

// Initialize with saved language from localStorage or default to Arabic
const savedLanguage = localStorage.getItem('i18nextLng') || 'ar';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ar',
    supportedLngs: ['en', 'fr', 'ar'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    react: { useSuspense: false }
  });

export default i18n;
