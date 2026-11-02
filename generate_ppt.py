import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_sbms_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette - Bright, clean, modern
    BG_LIGHT = RGBColor(248, 250, 252)       # #F8FAFC
    WHITE = RGBColor(255, 255, 255)          # #FFFFFF
    PRIMARY_BLUE = RGBColor(37, 99, 235)     # #2563EB (Royal Blue)
    DARK_NAVY = RGBColor(15, 23, 42)         # #0F172A (Text primary)
    SLATE_GRAY = RGBColor(71, 85, 105)       # #475569 (Text secondary)
    CARD_BG = RGBColor(255, 255, 255)        # Pure White
    CARD_BORDER = RGBColor(226, 232, 240)    # #E2E8F0
    EMERALD = RGBColor(16, 185, 129)         # #10B981 (Success / Green)
    INDIGO = RGBColor(99, 102, 241)          # #6366F1
    AMBER = RGBColor(245, 158, 11)           # #F59E0B
    SKY_BLUE = RGBColor(14, 165, 233)        # #0EA5E9

    def add_background(slide, color=BG_LIGHT):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="SMART BUSINESS MANAGEMENT SYSTEM"):
        # Category tag badge
        tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.8), Inches(0.35))
        tag.fill.solid()
        tag.fill.fore_color.rgb = RGBColor(239, 246, 255)
        tag.line.color.rgb = RGBColor(191, 219, 254)
        tf_tag = tag.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_text.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY_BLUE
        p_tag.font.name = "Segoe UI"
        p_tag.alignment = PP_ALIGN.CENTER

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        p.font.name = "Segoe UI"

    def add_card(slide, left, top, width, height, title, items, badge="", badge_color=PRIMARY_BLUE, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.2)

        # Header in card
        p_title = tf.paragraphs[0]
        if badge:
            p_title.text = f"{badge}  {title}"
        else:
            p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = DARK_NAVY
        p_title.font.name = "Segoe UI"
        p_title.space_after = Pt(10)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.size = Pt(12)
            p.font.color.rgb = SLATE_GRAY
            p.font.name = "Segoe UI"
            p.space_after = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 1: Title Slide (Hero, Vibrant & Bright)
    # -------------------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    add_background(slide1, RGBColor(240, 249, 255)) # Soft ice-blue gradient feel

    # Accent decorative banner top
    accent_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.15))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = PRIMARY_BLUE
    accent_bar.line.fill.background()

    # Hero Card in Center
    hero_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = WHITE
    hero_card.line.color.rgb = RGBColor(219, 234, 254)
    hero_card.line.width = Pt(2)

    tf1 = hero_card.text_frame
    tf1.word_wrap = True
    tf1.margin_left = Inches(0.8)
    tf1.margin_right = Inches(0.8)
    tf1.margin_top = Inches(0.6)

    p = tf1.paragraphs[0]
    p.text = "SMART BUSINESS MANAGEMENT SYSTEM (SBMS)"
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_BLUE
    p.font.name = "Segoe UI"
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(12)

    p_sub = tf1.add_paragraph()
    p_sub.text = "A Modern, All-in-One Cloud & Offline-Ready Enterprise Retail Suite"
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = DARK_NAVY
    p_sub.font.name = "Segoe UI"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.space_after = Pt(24)

    # Feature badges line
    p_badges = tf1.add_paragraph()
    p_badges.text = "⚡ Real-Time POS Billing  |  📊 Interactive Analytics  |  👥 Employee & Payroll  |  📦 Inventory Control"
    p_badges.font.size = Pt(13)
    p_badges.font.bold = True
    p_badges.font.color.rgb = EMERALD
    p_badges.font.name = "Segoe UI"
    p_badges.alignment = PP_ALIGN.CENTER
    p_badges.space_after = Pt(36)

    # Metadata / Author box
    p_author = tf1.add_paragraph()
    p_author.text = "Developed by: Vinit Patil  •  Project Lead & Full Stack Architect"
    p_author.font.size = Pt(13)
    p_author.font.bold = True
    p_author.font.color.rgb = DARK_NAVY
    p_author.font.name = "Segoe UI"
    p_author.alignment = PP_ALIGN.CENTER

    p_tech = tf1.add_paragraph()
    p_tech.text = "Tech Stack: React 18, Tailwind CSS, Express, MongoDB, Firebase Auth & Local Persistence"
    p_tech.font.size = Pt(11)
    p_tech.font.color.rgb = SLATE_GRAY
    p_tech.font.name = "Segoe UI"
    p_tech.alignment = PP_ALIGN.CENTER

    # -------------------------------------------------------------------------
    # SLIDE 2: Project Vision & Motivation
    # -------------------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_background(slide2)
    add_header(slide2, "Project Vision & Industry Problem Statement")

    add_card(slide2, 0.8, 1.8, 5.6, 5.0, "Traditional Retail Pain Points", [
        "Fragmented Tools: Billing on desktop, inventory in spreadsheets, payroll on paper.",
        "Server Dependency: Slow internet or downtime halts billing counters.",
        "Lack of Real-Time Insights: Store owners cannot spot top-selling items or margins instantly.",
        "Complex & Costly ERPs: Expensive enterprise solutions with steep learning curves.",
        "Prone to Human Error: Manual calculations cause billing discrepancies and stockouts."
    ], "❌", AMBER, RGBColor(254, 215, 170))

    add_card(slide2, 6.9, 1.8, 5.6, 5.0, "The SBMS Solution", [
        "Unified Operating System: POS, inventory, employees, and analytics in one clean UI.",
        "Zero-Downtime Resilience: Works seamlessly online or offline via smart local store syncing.",
        "One-Click Thermal Invoices: Instant GST billing, auto discounts, and thermal printing.",
        "Live Recharts Dashboard: Dynamic sales trends, category distribution, and profit metrics.",
        "Dual-Mode Onboarding: Sample Showroom for instant preview or Clean Store for live sales."
    ], "✅", EMERALD, RGBColor(167, 243, 208))

    # -------------------------------------------------------------------------
    # SLIDE 3: System Architecture & Tech Stack
    # -------------------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_background(slide3)
    add_header(slide3, "Full Stack Architecture & Technologies")

    add_card(slide3, 0.8, 1.8, 3.6, 5.0, "Frontend Layer", [
        "React 18 & Vite: High-performance single page app with instant hot module reloading.",
        "Tailwind CSS: Modern responsive design system with clean card layouts.",
        "Recharts Engine: Interactive charts for sales trends and category distributions.",
        "Lucide Icons: Crisp visual indicators across all modules.",
        "Axios + Interceptors: Smart token management and mock store fallback."
    ], "💻", PRIMARY_BLUE)

    add_card(slide3, 4.8, 1.8, 3.6, 5.0, "Backend & Persistence", [
        "Node.js & Express: RESTful micro-endpoints for sales, inventory, and users.",
        "MongoDB & Mongoose: Flexible document schema for catalog and transaction data.",
        "Smart Local Store: Client-side persistent fallback for standalone zero-latency operation.",
        "User Scoped Storage: Secure isolation (sbms_user_<uid>_*) per business account.",
        "Bcrypt & JWT: Industry-standard security and access tokens."
    ], "⚙️", INDIGO)

    add_card(slide3, 8.8, 1.8, 3.6, 5.0, "Cloud & Deployment", [
        "Firebase Authentication: Multi-provider login (Google OAuth & Email/Password).",
        "Vercel Edge Hosting: Auto-deploying production builds via GitHub CI/CD.",
        "Thermal Print Utility: Native browser print bridge formatted for 58mm/80mm receipts.",
        "PDF Generator Engine: Automated report and invoice document creation.",
        "Modular Component Tree: Reusable UI blocks for rapid expansion."
    ], "☁️", SKY_BLUE)

    # -------------------------------------------------------------------------
    # SLIDE 4: Core Functional Modules
    # -------------------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_background(slide4)
    add_header(slide4, "Core Functional Modules Overview")

    modules = [
        ("POS & Billing", "Lightning-fast barcode scanning, live cart, tax calculation, and thermal receipts.", "⚡", 0.8, 1.8),
        ("Inventory & Stock", "Catalog tracking, reorder alert triggers, batch editing, and margin calculations.", "📦", 4.8, 1.8),
        ("Employee & Payroll", "Staff directory, 1-click attendance marking, overtime, and automated salary slip.", "👥", 8.8, 1.8),
        ("Expenses Tracker", "Operational expense recording, vendor categorisation, and profit deduction.", "💳", 0.8, 4.4),
        ("Analytics & BI", "Visual charts for revenue vs expenses, top-selling items, and weekly sales curves.", "📊", 4.8, 4.4),
        ("Dual Workspace", "Toggle instantly between 'Sample Showroom' for testing and 'Clean Zero Store'.", "🌱", 8.8, 4.4),
    ]

    for title, desc, icon, left, top in modules:
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(3.6), Inches(2.4))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        p.font.name = "Segoe UI"
        p.space_after = Pt(8)

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = SLATE_GRAY
        p_desc.font.name = "Segoe UI"

    # -------------------------------------------------------------------------
    # SLIDE 5: Modern Point of Sale (POS) Engine
    # -------------------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_background(slide5)
    add_header(slide5, "Point of Sale (POS) & Billing Workflow")

    add_card(slide5, 0.8, 1.8, 5.6, 5.0, "High-Speed Billing Experience", [
        "Instant Search & Scan: Query products by SKU, name, or barcode in milliseconds.",
        "Interactive Cart: Adjust quantities, item-level discounts, or bulk percentage off.",
        "Automatic Tax Calculation: Real-time GST calculation (CGST + SGST split).",
        "Multiple Payment Modes: Cash, UPI / QR, Credit/Debit Cards, and Split Tender.",
        "Customer Tagging: Attach customer phone and name for transaction history."
    ], "🛒", PRIMARY_BLUE)

    add_card(slide5, 6.9, 1.8, 5.6, 5.0, "Invoice Generation & Print Output", [
        "Thermal Receipt Mode: Formatted for 58mm and 80mm standard POS printers.",
        "Full Tax Invoice: Detailed A4 invoice format complete with terms and business branding.",
        "Zero-Friction Checkout: One-click 'Complete Sale & Print' modal prevents billing delays.",
        "Auto Stock Deduction: Inventory counts automatically sync upon invoice generation.",
        "Audit Trail: Every sale is assigned a tamper-proof timestamped invoice number."
    ], "🧾", EMERALD)

    # -------------------------------------------------------------------------
    # SLIDE 6: Employee & Payroll Management
    # -------------------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_background(slide6)
    add_header(slide6, "Employee Directory & Automated Payroll")

    add_card(slide6, 0.8, 1.8, 5.6, 5.0, "Employee & Attendance System", [
        "Staff Profiles: Store employee name, role, department, base salary, and join date.",
        "1-Click Attendance Calendar: Mark Present, Absent, Half-Day, or Leave with a single tap.",
        "Monthly Attendance Summary: Computes total working days and present days automatically.",
        "Status Badges: Color-coded indicators for quick visual inspection by managers.",
        "Real-Time Sync: Attendance updates immediately reflect in the payroll calculation table."
    ], "📅", INDIGO)

    add_card(slide6, 6.9, 1.8, 5.6, 5.0, "Smart Payroll Calculation Engine", [
        "Automated Net Pay: Calculates daily wage rate = (Base Salary / Total Month Days).",
        "Leave & Absence Deduction: Automatically calculates deductions based on attendance records.",
        "Bonuses & Allowances: Easy inputs for incentives, festival bonuses, or travel allowances.",
        "Payroll Status Tracking: Mark payouts as 'Pending' or 'Paid' with payment date logs.",
        "Expense Integration: Disbursed payroll can be automatically logged into store expenses."
    ], "💰", AMBER)

    # -------------------------------------------------------------------------
    # SLIDE 7: Analytics & Real-Time Dashboard
    # -------------------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_background(slide7)
    add_header(slide7, "Executive Dashboard & Visual Intelligence")

    add_card(slide7, 0.8, 1.8, 3.6, 5.0, "Key Metric KPI Cards", [
        "Total Revenue: Real-time calculation of gross revenue and net earnings.",
        "Orders Count: Total completed transactions across today, week, and month.",
        "Average Order Value: Tracks retail basket size and sales productivity.",
        "Low Stock Alerts: Instant visual warnings when item count drops below threshold.",
        "Active Employees: Live count of staff on duty today."
    ], "📈", PRIMARY_BLUE)

    add_card(slide7, 4.8, 1.8, 3.6, 5.0, "Interactive Recharts", [
        "Sales Trend (Area Chart): Visualizes daily and monthly revenue spikes.",
        "Category Breakdown (Pie/Donut): Identifies high-margin vs high-volume product lines.",
        "Revenue vs Expense (Bar Chart): Instant comparison of operational costs vs gross income.",
        "Responsive Resize: Charts adapt cleanly to mobile, tablet, and widescreen monitors.",
        "Tooltip Details: Hover over data points for micro-level sales numbers."
    ], "📊", INDIGO)

    add_card(slide7, 8.8, 1.8, 3.6, 5.0, "Actionable Decision Making", [
        "Dead-Stock Identification: Quickly detect slow-moving inventory to run clearance sales.",
        "Top-Performing Staff: Track sales per employee to reward top performers.",
        "Expense Control: Categorised spending helps identify budget leaks.",
        "Profit Margin Optimization: Real-time cost price vs retail price tracking.",
        "Export Capability: Download summaries for accountant review."
    ], "🎯", EMERALD)

    # -------------------------------------------------------------------------
    # SLIDE 8: Dual Workspace Architecture
    # -------------------------------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_background(slide8)
    add_header(slide8, "Unique Feature: Dual Workspace Architecture")

    add_card(slide8, 0.8, 1.8, 5.6, 5.0, "✨ Showroom Mode (Testing & Demo)", [
        "Pre-Populated Data: Loaded with realistic grocery, electronics, and apparel items.",
        "Pre-Built Charts: Immediate historical sales trends and category distributions.",
        "Instant POS Sandbox: Test billing, receipts, discounts, and prints immediately.",
        "Zero Configuration: Evaluators and investors can test without entering manual data.",
        "One-Click Reload: Always reset back to a clean sample showcase in 1 click."
    ], "✨", PRIMARY_BLUE, RGBColor(191, 219, 254))

    add_card(slide8, 6.9, 1.8, 5.6, 5.0, "🌱 Clean Zero Store (Live Business)", [
        "1-Click Wipe: Transitions into a fresh, pristine 0-record store instantly.",
        "Real Data Integrity: No fake transactions mixing with actual tax and accounting records.",
        "Isolated Per User: User data stored securely under unique account identifiers.",
        "Instant Sample Recovery: If testing is desired again, toggle back anytime.",
        "Production Ready: Designed for immediate real-world shopkeeper deployment."
    ], "🌱", EMERALD, RGBColor(167, 243, 208))

    # -------------------------------------------------------------------------
    # SLIDE 9: Security, Performance & Deployment
    # -------------------------------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    add_background(slide9)
    add_header(slide9, "Security, Resilience & Cloud Deployment")

    add_card(slide9, 0.8, 1.8, 3.6, 5.0, "Security & Auth", [
        "Firebase OAuth: Google Sign-In and secure email credential management.",
        "JWT Protection: Authenticated token headers on API calls.",
        "RBAC Ready: Role-based access for Admin, Manager, and Cashier roles.",
        "Sanitized Inputs: Protection against XSS and injection vulnerabilities.",
        "Zero Secret Leaks: Client-safe environment keys for cloud hosting."
    ], "🔒", PRIMARY_BLUE)

    add_card(slide9, 4.8, 1.8, 3.6, 5.0, "Offline-First Resilience", [
        "Smart Mock Store: Auto-detects standalone client environment on Vercel.",
        "Local Storage Sync: Uninterrupted billing even when network drops.",
        "Optimistic UI Updates: UI responds instantaneously without spinner lag.",
        "Automatic Recovery: Seamless reconciliation when internet reconnects.",
        "Cross-Tab Synchronization: State mirrors across multiple POS terminals."
    ], "⚡", AMBER)

    add_card(slide9, 8.8, 1.8, 3.6, 5.0, "Vercel Cloud CI/CD", [
        "GitHub Integration: Every git push automatically triggers a verified build.",
        "Edge CDN Delivery: Sub-second global asset delivery for fast load times.",
        "Zero-Config Serverless: Automated rewrites ensure clean SPA client routing.",
        "Production Tested: Verified with 100% successful Vite production builds.",
        "Public Live URL: Instantly accessible worldwide across all devices."
    ], "🚀", EMERALD)

    # -------------------------------------------------------------------------
    # SLIDE 10: Conclusion & Future Roadmap
    # -------------------------------------------------------------------------
    slide10 = prs.slides.add_slide(blank_layout)
    add_background(slide10, RGBColor(240, 249, 255))
    add_header(slide10, "Summary & Future Roadmap", "PROJECT CONCLUSION")

    add_card(slide10, 0.8, 1.8, 5.6, 5.0, "Project Accomplishments", [
        "Complete Retail ERP: Successfully engineered POS, Inventory, HR, and Analytics.",
        "Universal Compatibility: Runs smoothly on Desktop, Tablet, and Mobile devices.",
        "Zero Setup Barrier: Anyone can test immediately with the Showroom Mode.",
        "High Customer Satisfaction: Fast checkout speeds and clear thermal receipts.",
        "Verified Live Deployment: Hosted and operating live on Vercel CDN."
    ], "🏆", EMERALD, RGBColor(167, 243, 208))

    add_card(slide10, 6.9, 1.8, 5.6, 5.0, "Future Roadmap", [
        "Multi-Store Synchronization: Central warehouse and branch management.",
        "AI Demand Forecasting: Predict stockouts before they occur using machine learning.",
        "Direct UPI QR Integration: Dynamic customer-facing payment screens.",
        "WhatsApp Invoice Delivery: Automatically send digital receipt PDFs via WhatsApp.",
        "Native Android App: Mobile POS with bluetooth thermal printer support."
    ], "🔮", PRIMARY_BLUE, RGBColor(191, 219, 254))

    # Output file
    output_path = r"d:\SBMS project\Smart_Business_Management_System_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_sbms_presentation()
