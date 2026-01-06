"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "@/app/actions/user";
import { useAuth } from "@/components/providers/auth-provider";
import { AvatarUpload } from "./avatar-upload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, X, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable().or(z.literal("")),
  location: z.string().max(100, "Location must be less than 100 characters").optional().nullable().or(z.literal("")),
  website: z.union([
    z.string().url("Invalid website URL"),
    z.literal(""),
    z.null(),
  ]).optional(),
  twitterUrl: z.union([
    z.string().url("Invalid Twitter URL"),
    z.literal(""),
    z.null(),
  ]).optional(),
  linkedinUrl: z.union([
    z.string().url("Invalid LinkedIn URL"),
    z.literal(""),
    z.null(),
  ]).optional(),
  facebookUrl: z.union([
    z.string().url("Invalid Facebook URL"),
    z.literal(""),
    z.null(),
  ]).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  timezone: z.string().optional().nullable().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  initialBio?: string | null;
  initialAvatarUrl?: string | null;
  initialPhone?: string | null;
  initialLocation?: string | null;
  initialWebsite?: string | null;
  initialTwitterUrl?: string | null;
  initialLinkedinUrl?: string | null;
  initialFacebookUrl?: string | null;
  initialSkills?: string[];
  initialLanguages?: string[];
  initialTimezone?: string | null;
  onSuccess?: () => void;
}

export function EditProfileForm({
  initialBio,
  initialAvatarUrl,
  initialPhone,
  initialLocation,
  initialWebsite,
  initialTwitterUrl,
  initialLinkedinUrl,
  initialFacebookUrl,
  initialSkills,
  initialLanguages,
  initialTimezone,
  onSuccess,
}: EditProfileFormProps) {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);

  // Common languages list
  const commonLanguages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian",
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Vietnamese", "Thai",
    "Indonesian", "Malay", "Turkish", "Polish", "Dutch", "Greek", "Hebrew",
    "Swedish", "Norwegian", "Danish", "Finnish", "Czech", "Romanian", "Hungarian",
    "Ukrainian", "Bengali", "Urdu", "Persian", "Tagalog", "Swahili", "Afrikaans"
  ];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialBio || "",
      avatarUrl: initialAvatarUrl || null,
      phone: initialPhone || "",
      location: initialLocation || "",
      website: initialWebsite || "",
      twitterUrl: initialTwitterUrl || "",
      linkedinUrl: initialLinkedinUrl || "",
      facebookUrl: initialFacebookUrl || "",
      skills: initialSkills || [],
      languages: initialLanguages || [],
      timezone: initialTimezone || "",
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !form.getValues("skills")?.includes(skillInput.trim())) {
      const currentSkills = form.getValues("skills") || [];
      form.setValue("skills", [...currentSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter((s) => s !== skill));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !form.getValues("languages")?.includes(languageInput.trim())) {
      const currentLanguages = form.getValues("languages") || [];
      form.setValue("languages", [...currentLanguages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (language: string) => {
    const currentLanguages = form.getValues("languages") || [];
    form.setValue("languages", currentLanguages.filter((l) => l !== language));
  };

  const handleLanguageInputChange = (value: string) => {
    setLanguageInput(value);
    if (value.trim().length > 0) {
      const filtered = commonLanguages.filter(
        (lang) =>
          lang.toLowerCase().includes(value.toLowerCase()) &&
          !form.getValues("languages")?.includes(lang)
      );
      setLanguageSuggestions(filtered.slice(0, 5));
      setShowLanguageSuggestions(filtered.length > 0);
    } else {
      setLanguageSuggestions([]);
      setShowLanguageSuggestions(false);
    }
  };

  const selectLanguage = (language: string) => {
    if (!form.getValues("languages")?.includes(language)) {
      const currentLanguages = form.getValues("languages") || [];
      form.setValue("languages", [...currentLanguages, language]);
    }
    setLanguageInput("");
    setShowLanguageSuggestions(false);
    setLanguageSuggestions([]);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile(user.id, {
        bio: data.bio || undefined,
        avatarUrl: avatarUrl || undefined,
        phone: data.phone || undefined,
        location: data.location || undefined,
        website: data.website || undefined,
        twitterUrl: data.twitterUrl || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        facebookUrl: data.facebookUrl || undefined,
        skills: data.skills || [],
        languages: data.languages || [],
        timezone: data.timezone || undefined,
      });

      if (result.success) {
        alert("Profile updated successfully!");
        onSuccess?.();
        // Update localStorage với user mới
        if (result.user) {
          localStorage.setItem("pi_user", JSON.stringify(result.user));
        }
        window.location.reload(); // Refresh để cập nhật user data
      } else {
        console.error("Update profile error:", result.error);
        alert(result.error || "Failed to update profile. Please check the console for details.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please login to edit your profile</p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Upload */}
        <div className="pb-7 border-b border-gray-200/60">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-bold text-gray-900 mb-5 block">Profile Picture</FormLabel>
                <FormControl>
                  <AvatarUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    username={user.username}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bio */}
        <div className="pb-7 border-b border-gray-200/60">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold text-gray-900 mb-3 block">About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share a bit about yourself, your experience, and what makes you unique..."
                    className="min-h-[140px] resize-none text-sm leading-relaxed border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between mt-2">
                  <FormMessage />
                  <span className="text-xs text-gray-500 font-medium">
                    {field.value?.length || 0}/500
                  </span>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-5 pb-7 border-b border-gray-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contact Information</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 234 567 8900"
                      {...field}
                      value={field.value || ""}
                      className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City, Country"
                      {...field}
                      value={field.value || ""}
                      className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://yourwebsite.com"
                    type="url"
                    {...field}
                    value={field.value || ""}
                    className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Social Media */}
        <div className="space-y-5 pb-7 border-b border-gray-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Social Media</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Twitter */}
            <FormField
              control={form.control}
              name="twitterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Twitter</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://twitter.com/username"
                      type="url"
                      {...field}
                      value={field.value || ""}
                      className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LinkedIn */}
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      type="url"
                      {...field}
                      value={field.value || ""}
                      className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facebook */}
            <FormField
              control={form.control}
              name="facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">Facebook</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://facebook.com/username"
                      type="url"
                      {...field}
                      value={field.value || ""}
                      className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Skills & Languages */}
        <div className="space-y-6 pb-7 border-b border-gray-200/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Skills & Languages</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {/* Skills */}
            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-3 block">Skills</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Web Design, Photography"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          className="text-sm border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                        />
                        <Button 
                          type="button" 
                          onClick={addSkill} 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0 border-gray-300 hover:border-[#31BF75] hover:bg-[#31BF75]/5 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {form.watch("skills") && form.watch("skills")!.length > 0 && (
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50/80 rounded-lg border border-gray-200">
                          {form.watch("skills")!.map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="secondary" 
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-105"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}
            <FormField
              control={form.control}
              name="languages"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700 mb-3 block">Languages</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Type to search or select from suggestions..."
                              value={languageInput}
                              onChange={(e) => handleLanguageInputChange(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (languageSuggestions.length > 0) {
                                    selectLanguage(languageSuggestions[0]);
                                  } else {
                                    addLanguage();
                                  }
                                }
                              }}
                              onFocus={() => {
                                if (languageInput.trim().length > 0) {
                                  setShowLanguageSuggestions(true);
                                }
                              }}
                              onBlur={() => {
                                // Delay to allow click on suggestion
                                setTimeout(() => setShowLanguageSuggestions(false), 200);
                              }}
                              className="text-sm border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                            />
                            {/* Suggestions Dropdown */}
                            {showLanguageSuggestions && languageSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {languageSuggestions.map((lang) => (
                                  <button
                                    key={lang}
                                    type="button"
                                    onClick={() => selectLanguage(lang)}
                                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#31BF75]/5 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
                                  >
                                    <span className="flex-1 font-medium">{lang}</span>
                                    <Check className="h-4 w-4 text-[#31BF75]" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            onClick={addLanguage} 
                            variant="outline" 
                            size="icon" 
                            className="shrink-0 border-gray-300 hover:border-[#31BF75] hover:bg-[#31BF75]/5 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Quick Select Common Languages */}
                        {form.watch("languages") && form.watch("languages")!.length === 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2 font-medium">Quick select:</p>
                            <div className="flex flex-wrap gap-2">
                              {commonLanguages.slice(0, 8).map((lang) => {
                                const isSelected = form.getValues("languages")?.includes(lang);
                                return (
                                  <button
                                    key={lang}
                                    type="button"
                                    onClick={() => {
                                      if (!isSelected) {
                                        selectLanguage(lang);
                                      }
                                    }}
                                    disabled={isSelected}
                                    className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${
                                      isSelected
                                        ? "bg-[#31BF75] text-white border-[#31BF75] cursor-not-allowed shadow-sm"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-[#31BF75]/10 hover:border-[#31BF75] hover:text-[#31BF75]"
                                    }`}
                                  >
                                    {lang}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {form.watch("languages") && form.watch("languages")!.length > 0 && (
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50/80 rounded-lg border border-gray-200">
                          {form.watch("languages")!.map((language) => (
                            <Badge 
                              key={language} 
                              variant="outline" 
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-gray-300 hover:border-[#31BF75] hover:bg-[#31BF75]/5 transition-all"
                            >
                              {language}
                              <button
                                type="button"
                                onClick={() => removeLanguage(language)}
                                className="ml-0.5 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Timezone */}
        <div className="pb-7">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700 mb-2 block">Timezone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., UTC, America/New_York, Asia/Ho_Chi_Minh"
                    {...field}
                    value={field.value || ""}
                    className="text-sm border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 transition-all"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500 mt-1.5">
                  Helps buyers know when you're available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={saving} 
            className="w-full sm:w-auto min-w-[160px] group relative overflow-hidden bg-gradient-to-r from-[#31BF75] to-[#27995E] text-white border-0 shadow-lg hover:shadow-xl hover:shadow-[#31BF75]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-semibold" 
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span className="relative z-10">Save Changes</span>
                {/* Shine effect on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                {/* Glow effect */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#31BF75]/20 via-transparent to-[#27995E]/20 blur-xl"></span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
