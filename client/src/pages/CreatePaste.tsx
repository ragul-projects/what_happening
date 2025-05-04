import { useState, useEffect } from "react";
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

const formSchema = insertPasteSchema.extend({
  expirationMinutes: z.union([z.number().nullable(), z.string()]),
});

type CreatePasteFormValues = z.infer<typeof formSchema>;

const CreatePaste = () => {
  const { toast } = useToast();
  const { verifyAdmin } = useAdmin();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePasteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      language: "plaintext",
      expirationMinutes: null,
      authorName: "Anonymous",
      tags: [],
    },
  });

  const createPasteMutation = useMutation({
    mutationFn: async (data: CreatePasteFormValues) => {
      return apiRequest("POST", "/api/pastes", data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your code snippet has been created",
      });
      navigate(`/paste/${data.pasteId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create paste. Please try again.",
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          onChange={async (e) => {
                            // Only proceed with change if admin password is provided and correct
                            if (field.value && e.target.value !== field.value) {
                              const isAdmin = await verifyAdmin();
                              if (isAdmin) {
                                field.onChange(e);
                              } else {
                                // Reset to previous value if not admin
                                e.target.value = field.value;
                                toast({
                                  title: "Access Denied",
                                  description: "Only admins can modify content in text boxes",
                                  variant: "destructive",
                                });
                              }
                            } else {
                              // Initial input (when field is empty) doesn't require validation
                              field.onChange(e);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {isSubmitting ? "Creating..." : "Create Paste"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePaste;
