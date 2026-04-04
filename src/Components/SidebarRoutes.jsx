import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { BadgeCheck, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../Config/Config";
import axiosInstance from "../Config/axiosConfig";

// ─── Constants ────────────────────────────────────────────────────────────────

const PASTEL = {
    rose:     "#FFD6DC",
    lavender: "#E4D4F4",
    mint:     "#C8F0E0",
    sky:      "#C8E6FF",
    peach:    "#FFE5CC",
    lemon:    "#FFF4C2",
    bg:       "#FAF7FF",
    surface:  "#FFFFFF",
    text:     "#3D3050",
    muted:    "#9188A8",
    border:   "#E8E0F5",
    accent:   "#B48EE8",
};

const fieldColors = [
    { bg: PASTEL.lavender, hover: "#D5C4F0", ring: "#B48EE8" },
    { bg: PASTEL.sky,      hover: "#ADD8FF", ring: "#6ABAFF" },
    { bg: PASTEL.mint,     hover: "#A8EDD2", ring: "#4DD9A0" },
    { bg: PASTEL.peach,    hover: "#FFCFA0", ring: "#FFB06A" },
    { bg: PASTEL.rose,     hover: "#FFC0CA", ring: "#FF8FA0" },
    { bg: PASTEL.lemon,    hover: "#FFE880", ring: "#F5C800" },
];

const EMP_CATEGORIES = ["Manager", "Developer", "Designer", "QA", "HR", "Finance", "Operations"];

const inputBase = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1.5px solid transparent",
    fontSize: "13px",
    fontFamily: "inherit",
    fontWeight: 500,
    color: PASTEL.text,
    outline: "none",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children, delay = 0 }) {
    return (
        <div style={{ animation: `slideUp 0.5s ease both`, animationDelay: `${delay}ms` }}>
            <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#6B5E8A",
                marginBottom: "5px",
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function HoverInput({ color, type = "text", placeholder, value, onChange, name, disabled = false }) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    return (
        <input
            type={type} name={name} placeholder={placeholder}
            value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            disabled={disabled}
            style={{
                ...inputBase,
                backgroundColor: disabled ? "#f0f0f0" : (hovered || focused ? color.hover : color.bg),
                borderColor: focused ? color.ring : "transparent",
                boxShadow: focused ? `0 0 0 3px ${color.ring}40`
                    : hovered ? `0 4px 12px ${color.ring}30` : "none",
                transform: hovered && !focused && !disabled ? "translateY(-1px)" : "none",
                cursor: disabled ? "not-allowed" : "text",
                opacity: disabled ? 0.7 : 1,
            }}
        />
    );
}

function HoverSelect({ color, value, onChange, name, children, disabled = false }) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    return (
        <select
            name={name} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            disabled={disabled}
            style={{
                ...inputBase,
                backgroundColor: disabled ? "#f0f0f0" : (hovered || focused ? color.hover : color.bg),
                borderColor: focused ? color.ring : "transparent",
                boxShadow: focused ? `0 0 0 3px ${color.ring}40`
                    : hovered ? `0 4px 12px ${color.ring}30` : "none",
                transform: hovered && !focused && !disabled ? "translateY(-1px)" : "none",
                cursor: disabled ? "not-allowed" : "pointer", 
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239188A8' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px",
                opacity: disabled ? 0.7 : 1,
            }}
        >
            {children}
        </select>
    );
}

function ToggleSwitch({ checked, onChange, color }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button type="button" role="switch" aria-checked={checked}
                onClick={() => onChange(!checked)}
                style={{
                    width: "40px", height: "22px", borderRadius: "999px",
                    border: "none", cursor: "pointer",
                    background: checked ? `linear-gradient(135deg, ${color.ring}, ${color.hover})` : PASTEL.border,
                    position: "relative", transition: "all 0.3s ease",
                    boxShadow: checked ? `0 3px 8px ${color.ring}50` : "none",
                    outline: "none", flexShrink: 0,
                }}
            >
                <span style={{
                    position: "absolute", top: "3px",
                    left: checked ? "20px" : "3px",
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: "#fff", transition: "left 0.3s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }} />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 600, color: checked ? color.ring : PASTEL.muted, transition: "color 0.3s" }}>
                {checked ? "Active" : "Inactive"}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SidebarRoutes = () => {
    const [form, setForm] = useState({
        menu_name: "",
        route_path: "",
        icon: "",
        order_no: "",
        emp_category: "",
        is_active: true,
        sidebarRoute_Id: "",
    });

    const [btnHover, setBtnHover] = useState(false);
    const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {})
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/getSideBarData`,
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken?.token}`,
                    },
                }
            );

            // Check the actual structure of your API response
            console.log("API Response:", response.data);
            
            // Assuming response.data contains the array directly or has a data property
            const menuItems = response.data.data || response.data || [];
            setMenuData(menuItems);
            
            console.log("Menu Data:", menuItems);

        } catch (err) {
            console.error("Error In Getting Sidebar Data:", err);
            Swal.fire({
                title: "Error!",
                text: "Failed to load menu data",
                icon: "error",
                confirmButtonColor: PASTEL.accent,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userToken?.token) {
            getData();
        }
    }, [userToken?.token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle menu selection - auto-fill other fields from API data
    const handleMenuSelect = (e) => {
        const selectedMenuName = e.target.value;
        
        if (selectedMenuName === "Custom") {
            // Clear fields for custom entry
            setForm((prev) => ({
                ...prev,
                menu_name: "",
                route_path: "",
                icon: "",
                order_no: "",
                emp_category: "",
            }));
        } else {
            // Find selected menu from API data
            const selectedMenu = menuData.find(menu => menu.menu_name === selectedMenuName);
            
            if (selectedMenu) {
                setForm((prev) => ({
                    ...prev,
                    menu_name: selectedMenu.menu_name,
                    route_path: selectedMenu.route_path || "",
                    icon: selectedMenu.icon || "",
                    order_no: selectedMenu.order_no || "",
                    emp_category: selectedMenu.emp_category || "",
                    sidebarRoute_Id: selectedMenu.sidebarRoute_Id || prev.sidebarRoute_Id,
                }));
            } else {
                // If menu not found, just set the name
                setForm((prev) => ({
                    ...prev,
                    menu_name: selectedMenuName,
                }));
            }
        }
    };

    const handleReset = () => {
        setForm({ 
            menu_name: "", 
            route_path: "", 
            icon: "", 
            order_no: "", 
            emp_category: "", 
            is_active: true, 
            sidebarRoute_Id: "" 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.menu_name || !form.route_path || !form.order_no) {
            Swal.fire({
                title: "Validation Error",
                text: "Please fill all required fields",
                icon: "warning",
                confirmButtonColor: PASTEL.accent,
            });
            return;
        }

        try {
            const payload = [
                {
                    menu_name: form.menu_name,
                    route_path: form.route_path,
                    icon: form.icon || null,
                    order_no: Number(form.order_no),
                    emp_category: form.emp_category || "HR",
                    is_active: form.is_active ? 1 : 0,
                }
            ];

            console.log("Sending Payload:", payload);

            const response = await axiosInstance.post(
                `${API_BASE_URL}/side-Route-Store`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${userToken.token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            console.log("Response:", response.data);

            Swal.fire({
                title: "Route Created!",
                text: response.data.message || "Saved successfully",
                icon: "success",
                confirmButtonColor: PASTEL.accent,
            });

            handleReset();
            // Refresh the menu data after successful submission
            getData();

        } catch (error) {
            console.error("Error:", error);

            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Something went wrong!",
                icon: "error",
                confirmButtonColor: PASTEL.accent,
            });
        }
    };

    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .swal-pastel { border-radius: 20px !important; font-family: inherit; }
            `}</style>

            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px 20px", fontFamily: "'Nunito', 'Segoe UI', sans-serif",
            }}>
                <div style={{
                    width: "100%", maxWidth: "560px",
                    background: PASTEL.surface,
                    borderRadius: "20px",
                    border: "2px solid #DDD4F5",
                    boxShadow: "0 8px 40px rgba(100,80,180,.12), 0 2px 8px rgba(100,80,180,.06)",
                    overflow: "hidden",
                    animation: "slideUp 0.4s ease both",
                }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${PASTEL.lavender} 0%, ${PASTEL.sky} 50%, ${PASTEL.mint} 100%)`,
                        padding: "22px 26px",
                        position: "relative", overflow: "hidden",
                        borderBottom: "2px solid #DDD4F5",
                    }}>
                        <div style={{ position: "absolute", top: "-24px", right: "-24px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,.35)" }} />
                        <div style={{ position: "absolute", bottom: "-18px", left: "30%", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,.2)" }} />

                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "42px", height: "42px", borderRadius: "12px",
                                background: "rgba(255,255,255,0.8)", fontSize: "20px",
                                boxShadow: "0 3px 10px rgba(100,80,180,.15)",
                                flexShrink: 0,
                            }}>🗂️</div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
                                    <h1 style={{ fontWeight: 800, fontSize: "17px", color: PASTEL.text, margin: 0, lineHeight: 1.2 }}>
                                        Create Sidebar Route
                                    </h1>
                                    <BadgeCheck size={16} color={PASTEL.accent} />
                                </div>
                                <p style={{ fontSize: "12px", color: PASTEL.muted, fontWeight: 500, margin: 0 }}>
                                    Configure a new navigation menu entry
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: "20px 24px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                            {/* Row 1: Sidebar Route ID + Order No */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: "12px" }}>
                                <Field label="Sidebar Route ID" delay={40}>
                                    <HoverInput 
                                        color={fieldColors[0]} 
                                        name="sidebarRoute_Id"
                                        placeholder="e.g. SBR-001" 
                                        value={form.sidebarRoute_Id} 
                                        onChange={handleChange} 
                                        disabled={loading}
                                    />
                                </Field>
                                <Field label="Order No." delay={40}>
                                    <HoverInput 
                                        color={fieldColors[4]} 
                                        type="number" 
                                        name="order_no"
                                        placeholder="1" 
                                        value={form.order_no} 
                                        onChange={handleChange} 
                                        disabled={loading}
                                    />
                                </Field>
                            </div>

                            {/* Row 2: Menu Name (Dropdown from API) + Route Path */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <Field label="Menu Name" delay={80}>
                                    <HoverSelect 
                                        color={fieldColors[1]} 
                                        name="menu_name"
                                        value={form.menu_name} 
                                        onChange={handleMenuSelect}
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Select a menu…</option>
                                        <option value="Custom">-- Custom (Manual Entry) --</option>
                                        {menuData && menuData.length > 0 ? (
                                            menuData.map((menu) => (
                                                <option key={menu.sidebarRoute_Id || menu.menu_name} value={menu.menu_name}>
                                                    {menu.menu_name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No menus available</option>
                                        )}
                                    </HoverSelect>
                                </Field>
                                <Field label="Route Path" delay={80}>
                                    <HoverInput 
                                        color={fieldColors[2]} 
                                        name="route_path"
                                        placeholder="e.g. /dashboard" 
                                        value={form.route_path} 
                                        onChange={handleChange} 
                                        disabled={loading}
                                    />
                                </Field>
                            </div>

                            {/* Row 3: Icon + Employee Category */}
                            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "12px" }}>
                                <Field label="Icon" delay={120}>
                                    <HoverInput 
                                        color={fieldColors[3]} 
                                        name="icon"
                                        placeholder="e.g. Users" 
                                        value={form.icon} 
                                        onChange={handleChange} 
                                        disabled={loading}
                                    />
                                </Field>
                                <Field label="Employee Category" delay={120}>
                                    <HoverSelect 
                                        color={fieldColors[5]} 
                                        name="emp_category"
                                        value={form.emp_category} 
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" disabled>Select a category…</option>
                                        {EMP_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </HoverSelect>
                                </Field>
                            </div>

                            {/* Row 4: Status */}
                            <Field label="Status" delay={160}>
                                <div style={{
                                    background: fieldColors[0].bg, borderRadius: "10px",
                                    padding: "10px 14px", display: "flex", alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    <span style={{ fontSize: "12px", color: PASTEL.muted, fontWeight: 500 }}>
                                        Toggle to activate this route
                                    </span>
                                    <ToggleSwitch 
                                        checked={form.is_active}
                                        onChange={(val) => setForm((p) => ({ ...p, is_active: val }))}
                                        color={fieldColors[0]} 
                                    />
                                </div>
                            </Field>

                            <div style={{ height: "1px", background: PASTEL.border }} />

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={loading}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 18px rgba(255,140,100,.45)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "none";
                                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(255,140,100,.25)";
                                    }}
                                    style={{
                                        flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                                        background: "linear-gradient(135deg, #FFD8C2, #FF9E7D)",
                                        color: "#5B2E1F", fontSize: "13px", fontWeight: 700,
                                        fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", 
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 3px 10px rgba(255,140,100,.25)",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    onMouseEnter={() => !loading && setBtnHover(true)}
                                    onMouseLeave={() => setBtnHover(false)}
                                    style={{
                                        flex: 1, padding: "9px", borderRadius: "10px", border: "none",
                                        background: btnHover && !loading
                                            ? `linear-gradient(135deg, #C8BEFF, #A07AE8)`
                                            : `linear-gradient(135deg, ${PASTEL.lavender}, ${PASTEL.accent})`,
                                        color: PASTEL.text, fontSize: "13px", fontWeight: 800,
                                        fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", 
                                        transition: "all 0.3s ease",
                                        boxShadow: btnHover && !loading ? "0 6px 20px rgba(160,120,230,.45)" : "0 3px 10px rgba(160,120,230,.22)",
                                        transform: btnHover && !loading ? "translateY(-2px)" : "none",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        gap: "6px", letterSpacing: "0.02em",
                                        opacity: loading ? 0.6 : 1,
                                    }}
                                >
                                    <CheckCircle size={14} />
                                    {loading ? "Loading..." : "Create Route"}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SidebarRoutes;