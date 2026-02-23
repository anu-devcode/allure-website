"use client";

import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { User, Mail, Phone, MapPin, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const user = useCustomerAuth((s) => s.user);
    const updateProfile = useCustomerAuth((s) => s.updateProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editCity, setEditCity] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setEditPhone(user.phone);
            setEditCity(user.city || "");
        }
    }, [user]);

    if (!user) return null;

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);

        const ok = await updateProfile({ name: editName, phone: editPhone, city: editCity });
        setSaving(false);

        if (!ok) {
            setSaveError("Could not update profile. Please try again.");
            return;
        }

        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditName(user.name);
        setEditPhone(user.phone);
        setEditCity(user.city || "");
    };

    const fields = [
        { label: "Full Name", value: user.name, editValue: editName, setValue: setEditName, icon: User, editable: true, type: "text", placeholder: "Your full name" },
        { label: "Email", value: user.email, icon: Mail, editable: false, type: "email" },
        { label: "Phone", value: user.phone || "Not set", editValue: editPhone, setValue: setEditPhone, icon: Phone, editable: true, type: "tel", placeholder: "e.g. 0911 223 344" },
        { label: "City", value: user.city || "Not set", editValue: editCity, setValue: setEditCity, icon: MapPin, editable: true, type: "text", placeholder: "e.g. Addis Ababa" },
    ];

    return (
        <div className="animate-slide-up-fade">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">Profile</h1>
                    <p className="text-sm text-dark/50 mt-1">Manage your personal information.</p>
                </div>
                {!isEditing ? (
                    <Button
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="gap-2 text-accent hover:text-accent/80 font-bold"
                    >
                        <Edit3 className="h-4 w-4" /> Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleCancel} className="gap-1.5 text-dark/40 hover:text-dark/60 font-bold">
                            <X className="h-4 w-4" /> Cancel
                        </Button>
                        <Button variant="primary" onClick={() => void handleSave()} className="gap-1.5 font-bold rounded-xl shadow-md" disabled={saving}>
                            <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </div>

            {saveError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-slide-up-fade">
                    <X className="h-4 w-4" /> {saveError}
                </div>
            )}

            {saved && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium border border-green-100 flex items-center gap-2 animate-slide-up-fade">
                    <Check className="h-4 w-4" /> Profile updated successfully!
                </div>
            )}

            {/* Profile Card */}
            <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-secondary/10 shadow-sm">
                {/* Avatar Section */}
                <div className="flex items-center gap-5 pb-6 border-b border-secondary/10 mb-6">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-accent/10 border-3 border-white shadow-lg flex items-center justify-center">
                            <span className="font-display text-2xl font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3" />
                        </div>
                    </div>
                    <div>
                        <p className="font-display text-lg font-bold text-dark">{user.name}</p>
                        <p className="text-sm text-dark/40">{user.email}</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-6">
                    {fields.map((field) => {
                        const Icon = field.icon;
                        return (
                            <div key={field.label} className="flex items-start gap-4">
                                <div className="h-11 w-11 rounded-xl bg-accent/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="h-4.5 w-4.5 text-accent/40" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30 mb-1.5">{field.label}</p>
                                    {isEditing && field.editable ? (
                                        <input
                                            type={field.type}
                                            value={field.editValue}
                                            onChange={(e) => field.setValue!(e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full h-11 rounded-xl border-2 border-secondary/10 px-4 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    ) : (
                                        <p className={`text-sm font-medium ${field.value === "Not set" ? "text-dark/30 italic" : "text-dark"}`}>
                                            {field.value}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
