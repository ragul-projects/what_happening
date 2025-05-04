import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPasteSchema, supportedLanguages, expirationOptions } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, FileUp } from "lucide-react";

const formSchema = insertPasteSchema.extend({
  expirationMinutes: z.union([z.number().nullable(), z.string()]),
});

type CreatePasteFormValues = z.infer<typeof formSchema>;

const CreatePaste = () => {
  const { toast } = useToast();
  const { verifyAdmin, isAdmin } = useAdmin();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("code");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreatePasteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      language: "plaintext",
      expirationMinutes: null as unknown as string, // to fix type error
      authorName: "Anonymous",
      isFile: false,
      fileName: "",
      fileType: "",
    },
  });

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if it's an XML file
    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        title: "Invalid File",
        description: "Only XML files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Read file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      form.setValue("content", content);
      form.setValue("fileName", file.name);
      form.setValue("fileType", "xml");
      form.setValue("language", "xml");
      form.setValue("isFile", true);
      form.setValue("title", file.name.replace('.xml', ''));
    };
    
    reader.readAsText(file);
  };

  // Handle file deletion
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    form.setValue("isFile", false);
    form.setValue("fileName", "");
    form.setValue("fileType", "");
    form.setValue("content", "");
  };

  const createPasteMutation = useMutation({
    mutationFn: async (data: CreatePasteFormValues) => {
      return apiRequest("POST", "/api/pastes", data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: form.getValues("isFile") 
          ? "Your file has been uploaded" 
          : "Your code snippet has been created",
      });
      navigate(`/paste/${data.pasteId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: form.getValues("isFile") 
          ? "Failed to upload file. Please try again." 
          : "Failed to create paste. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: CreatePasteFormValues) => {
    setIsSubmitting(true);
    createPasteMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Create New Paste</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="code" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="mb-6 bg-gray-700">
                <TabsTrigger value="code" className="data-[state=active]:bg-blue-600">Code Paste</TabsTrigger>
                <TabsTrigger value="file" className="data-[state=active]:bg-blue-600">XML File Upload</TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Title for your paste (optional)"
                              className="bg-gray-700 border-gray-600 text-gray-200"
                              {...field}
                              onFocus={async (e) => {
                                // Only verify if there's already content
                                if (!field.value) return;
                                
                                const isAdmin = await verifyAdmin();
                                if (!isAdmin) {
                                  e.target.blur();
                                  toast({
                                    title: "Access Denied",
                                    description: "Only admins can modify content in text fields",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Author Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name (optional)"
                              className="bg-gray-700 border-gray-600 text-gray-200"
                              {...field}
                              onFocus={async (e) => {
                                // Only verify if there's already content
                                if (!field.value) return;
                                
                                const isAdmin = await verifyAdmin();
                                if (!isAdmin) {
                                  e.target.blur();
                                  toast({
                                    title: "Access Denied",
                                    description: "Only admins can modify content in text fields",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <TabsContent value="code">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Code</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your code here..."
                              className="min-h-[300px] font-mono text-sm bg-gray-700 border-gray-600 text-gray-200"
                              {...field}
                              onFocus={async (e) => {
                                // Check for admin status when the textarea is focused
                                if (!field.value) {
                                  // Allow initial input (first-time focus)
                                  return;
                                }
                                
                                // Only require admin for editing existing content
                                const isAdmin = await verifyAdmin();
                                if (!isAdmin) {
                                  // If not admin, blur the field and show message
                                  e.target.blur();
                                  toast({
                                    title: "Access Denied",
                                    description: "Only admins can modify content in text boxes",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              onChange={(e) => {
                                // Already verified admin status on focus if needed
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="file">
                    <div className="mb-4">
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        {selectedFile ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                              <FileUp className="h-5 w-5 text-blue-500" />
                              <span className="text-gray-200 font-medium">{selectedFile.name}</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                              File size: {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                            
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem className="mt-4">
                                  <FormLabel className="text-gray-200">File Content Preview</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      readOnly={!isAdmin}
                                      className={`min-h-[200px] font-mono text-sm bg-gray-700 border-gray-600 ${isAdmin ? "text-gray-200" : "text-gray-400"}`}
                                      {...field}
                                      onFocus={async (e) => {
                                        const currentIsAdmin = await verifyAdmin();
                                        if (!currentIsAdmin) {
                                          e.target.blur();
                                          toast({
                                            title: "Access Denied",
                                            description: "Only admins can modify XML file content",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-center">
                              <Button 
                                type="button" 
                                variant="destructive"
                                onClick={handleRemoveFile}
                                className="mt-2"
                              >
                                Remove File
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-gray-200 font-medium">Drop your XML file here or click to browse</p>
                              <p className="text-gray-400 mt-1 text-sm">XML files only (.xml)</p>
                            </div>
                            <input
                              type="file"
                              accept=".xml"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button 
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              Browse Files
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="isFile"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={!!field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (checked && !selectedFile) {
                                        fileInputRef.current?.click();
                                      }
                                    }}
                                  />
                                </FormControl>
                                <Label className="text-gray-200">Save as downloadable XML file</Label>
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-gray-400 mt-1 text-xs">
                          When enabled, users will be able to download this as an XML file. Only admins can edit XML files.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Syntax Highlighting</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={activeTab === "file" ? "xml" : field.value}
                            disabled={activeTab === "file"}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-700 border-gray-600 text-gray-200">
                              {supportedLanguages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expirationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Expiration</FormLabel>
                          <Select 
                            onValueChange={value => field.onChange(value === "null" ? null : parseInt(value))} 
                            defaultValue={field.value === null ? "null" : field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                                <SelectValue placeholder="When does this paste expire?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-700 border-gray-600 text-gray-200">
                              {expirationOptions.map(option => (
                                <SelectItem key={option.name} value={option.value === null ? "null" : option.value.toString()}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : activeTab === "file" ? "Upload XML File" : "Create Paste"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePaste;
