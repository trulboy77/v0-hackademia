"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Download, Eye, Upload, Plus, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LibraryResource {
  id: string
  title: string
  description: string
  category: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  status: "pending" | "approved" | "rejected"
  uploaded_by: string
  created_at: string
  approved_at?: string
  approved_by?: string
  profiles?: {
    username: string
    full_name: string
  }
}

const categories = [
  "Web Security",
  "Binary Exploitation",
  "System Security",
  "Cryptography",
  "Forensics",
  "Reverse Engineering",
  "Network Security",
  "Mobile Security",
]

export function Library() {
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("approved")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    fetchResources()
    checkUserRole()
  }, [activeTab, selectedCategory])

  const checkUserRole = async () => {
    try {
      const response = await fetch("/api/auth/profile")
      if (response.ok) {
        const { profile } = await response.json()
        setUserRole(profile?.role || "user")
      }
    } catch (error) {
      console.error("Error checking user role:", error)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (activeTab !== "approved") params.append("status", activeTab)

      const response = await fetch(`/api/library?${params}`)
      if (response.ok) {
        const { resources } = await response.json()
        setResources(resources)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load library resources",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (formData: FormData) => {
    try {
      setUploading(true)
      const response = await fetch("/api/library/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Resource uploaded successfully and pending approval",
        })
        setUploadDialogOpen(false)
        fetchResources()
      } else {
        toast({
          title: "Error",
          description: result.error || "Upload failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleApproval = async (resourceId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/library/${resourceId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Resource ${action}d successfully`,
        })
        fetchResources()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || `Failed to ${action} resource`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} resource`,
        variant: "destructive",
      })
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const availableCategories = ["all", ...categories]

  return (
    <div className="h-full bg-background text-foreground">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Knowledge Library</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{filteredResources.length} resources</Badge>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Resource</DialogTitle>
                  <DialogDescription>
                    Upload a writeup, cheat sheet, or educational resource to share with the community.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleUpload(formData)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="file">File (PDF, DOC, TXT, MD, Images - Max 10MB)</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            {userRole === "admin" && <TabsTrigger value="rejected">Rejected</TabsTrigger>}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="text-center py-8">Loading resources...</div>
            ) : (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(resource.status)}
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(resource.status)}>{resource.status}</Badge>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-muted-foreground">
                          by {resource.profiles?.username || "Unknown"} • {formatDate(resource.created_at)}
                        </div>
                        <Badge variant="secondary">{resource.category}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(resource.file_size)}</span>
                          <span>{resource.file_type}</span>
                        </div>
                        <div className="flex space-x-2">
                          {userRole === "admin" && resource.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApproval(resource.id, "reject")}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button size="sm" onClick={() => handleApproval(resource.id, "approve")}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            </>
                          )}
                          {resource.status === "approved" && (
                            <>
                              <Button size="sm" variant="outline" asChild>
                                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </a>
                              </Button>
                              <Button size="sm" asChild>
                                <a href={resource.file_url} download={resource.file_name}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredResources.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No resources found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
