import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRole } from "@/App";

interface ProfileProps {
  userRole?: UserRole;
}

const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

type UserProfileValues = z.infer<typeof userProfileSchema>;

const startupProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  tagline: z.string().min(10, "Tagline must be at least 10 characters."),
  description: z.string().min(30, "Description must be at least 30 characters."),
  stage: z.string().min(1, "Please select a stage."),
  category: z.string().min(1, "Please select a category."),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  teamSize: z.coerce.number().min(1, "Team size must be at least 1."),
  foundedYear: z.coerce.number().min(2000).max(new Date().getFullYear()),
  marketSize: z.string().min(1, "Please enter market size."),
  businessModel: z.string().min(1, "Please select a business model."),
});

type StartupProfileValues = z.infer<typeof startupProfileSchema>;

export default function Profile({ userRole }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/me"],
  });
  
  const { data: startupData, isLoading: isStartupLoading } = useQuery({
    queryKey: ["/api/founder/startup"],
    enabled: userData?.role === "founder" || userRole === "founder",
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const { data: stages } = useQuery({
    queryKey: ["/api/stages"],
  });
  
  const { data: businessModels } = useQuery({
    queryKey: ["/api/business-models"],
  });
  
  // User profile form
  const userForm = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      location: "",
      company: "",
      title: "",
      website: "",
      twitter: "",
      linkedin: "",
    },
  });
  
  // Startup profile form
  const startupForm = useForm<StartupProfileValues>({
    resolver: zodResolver(startupProfileSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
      stage: "",
      category: "",
      location: "",
      website: "",
      teamSize: 1,
      foundedYear: new Date().getFullYear(),
      marketSize: "",
      businessModel: "",
    },
  });
  
  // Set form values when data is loaded
  useState(() => {
    if (userData) {
      userForm.reset({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || "",
        company: userData.company || "",
        title: userData.title || "",
        website: userData.website || "",
        twitter: userData.twitter || "",
        linkedin: userData.linkedin || "",
      });
    }
    
    if (startupData) {
      startupForm.reset({
        name: startupData.name || "",
        tagline: startupData.tagline || "",
        description: startupData.description || "",
        stage: startupData.stage || "",
        category: startupData.category || "",
        location: startupData.location || "",
        website: startupData.website || "",
        teamSize: startupData.teamSize || 1,
        foundedYear: startupData.foundedYear || new Date().getFullYear(),
        marketSize: startupData.marketSize || "",
        businessModel: startupData.businessModel || "",
      });
    }
  }, [userData, startupData]);
  
  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserProfileValues) => 
      apiRequest("PUT", "/api/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Update startup profile mutation
  const updateStartupMutation = useMutation({
    mutationFn: (data: StartupProfileValues) => 
      apiRequest("PUT", "/api/founder/startup", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/founder/startup"] });
      toast({
        title: "Startup profile updated",
        description: "Your startup profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update startup profile: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const onUserSubmit = (data: UserProfileValues) => {
    updateUserMutation.mutate(data);
  };
  
  const onStartupSubmit = (data: StartupProfileValues) => {
    updateStartupMutation.mutate(data);
  };
  
  if (isUserLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const role = userData?.role || userRole;
  
  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-500 text-sm">Manage your personal information and {role === "founder" ? "startup" : "investor"} profile</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            <TabsTrigger value={role === "founder" ? "startup" : "investment"}>
              {role === "founder" ? "Startup Profile" : "Investment Preferences"}
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData?.avatar} alt={userData?.name} />
                    <AvatarFallback>{userData?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="ml-6">
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                  </div>
                </div>
                
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={userForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={userForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={4} 
                              placeholder="Tell us about yourself..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={userForm.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="@username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userForm.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateUserMutation.isPending || !userForm.formState.isDirty}
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Startup Profile Tab (for Founders) */}
          {role === "founder" && (
            <TabsContent value="startup">
              <Card>
                <CardHeader>
                  <CardTitle>Startup Profile</CardTitle>
                  <CardDescription>
                    Update your startup's information to attract investors.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isStartupLoading ? (
                    <div className="animate-pulse">
                      <div className="h-40 bg-gray-200 rounded mb-6"></div>
                      <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <Form {...startupForm}>
                      <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-6">
                        <div className="flex items-center mb-6">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            {startupData?.logo ? (
                              <img src={startupData.logo} alt={startupData.name} className="w-16 h-16 object-contain" />
                            ) : (
                              <i className="fas fa-building text-2xl text-gray-400"></i>
                            )}
                          </div>
                          <div className="ml-6">
                            <Button variant="outline" size="sm">
                              Upload Logo
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={startupForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={startupForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="">Select a category</option>
                                    {categories?.map((category: any) => (
                                      <option key={category.id} value={category.id}>
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={startupForm.control}
                          name="tagline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tagline</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="A brief one-liner about your startup" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={startupForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={4} 
                                  placeholder="Describe what your startup does..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={startupForm.control}
                            name="stage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stage</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="">Select stage</option>
                                    {stages?.map((stage: any) => (
                                      <option key={stage.id} value={stage.id}>
                                        {stage.name}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={startupForm.control}
                            name="teamSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Team Size</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={startupForm.control}
                            name="foundedYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Founded Year</FormLabel>
                                <FormControl>
                                  <Input type="number" min="2000" max={new Date().getFullYear()} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={startupForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={startupForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={startupForm.control}
                            name="businessModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Model</FormLabel>
                                <FormControl>
                                  <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                  >
                                    <option value="">Select model</option>
                                    {businessModels?.map((model: any) => (
                                      <option key={model.id} value={model.id}>
                                        {model.name}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={startupForm.control}
                            name="marketSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Market Size</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g. $10B" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={updateStartupMutation.isPending || !startupForm.formState.isDirty}
                          >
                            {updateStartupMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Investment Preferences Tab (for Investors) */}
          {role === "investor" && (
            <TabsContent value="investment">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Preferences</CardTitle>
                  <CardDescription>
                    Update your investment criteria to match with relevant startups.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Investment preferences form would go here */}
                    <div className="text-center py-8">
                      <p className="text-gray-500">Investment preferences form would go here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
