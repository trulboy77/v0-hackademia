"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Users, BookOpen, Video, Eye, EyeOff, Clock, Star, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: number
  thumbnail?: string
  is_published: boolean
  created_at: string
  instructor: {
    username: string
    full_name: string
  }
  lessons: { count: number }[]
  enrollments: { count: number }[]
}

interface Lesson {
  id: string
  title: string
  description: string
  video_url?: string
  duration: number
  order_index: number
  is_free: boolean
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

const levels = ["Beginner", "Intermediate", "Advanced"]

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("courses")
  const [createCourseOpen, setCreateCourseOpen] = useState(false)
  const [createLessonOpen, setCreateLessonOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/courses")
      if (response.ok) {
        const { courses } = await response.json()
        setCourses(courses)
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to fetch courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`)
      if (response.ok) {
        const { lessons } = await response.json()
        setLessons(lessons)
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
    }
  }

  const handleCreateCourse = async (formData: FormData) => {
    try {
      const courseData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        level: formData.get("level") as string,
        duration: Number.parseInt(formData.get("duration") as string) || 0,
        thumbnail: formData.get("thumbnail") as string,
        is_published: formData.get("is_published") === "on",
      }

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course created successfully",
        })
        setCreateCourseOpen(false)
        fetchCourses()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to create course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        })
        fetchCourses()
        if (selectedCourse?.id === courseId) {
          setSelectedCourse({ ...selectedCourse, ...updates })
        }
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to update course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
        fetchCourses()
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null)
        }
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleCreateLesson = async (formData: FormData) => {
    if (!selectedCourse) return

    try {
      const lessonData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        video_url: formData.get("video_url") as string,
        duration: Number.parseInt(formData.get("duration") as string) || 0,
        order_index: lessons.length,
        is_free: formData.get("is_free") === "on",
      }

      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lesson created successfully",
        })
        setCreateLessonOpen(false)
        fetchLessons(selectedCourse.id)
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to create lesson",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
      toast({
        title: "Error",
        description: "Failed to create lesson",
        variant: "destructive",
      })
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="lessons">Course Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Course Management</h1>
            <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>Create a new course for your students.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateCourse(formData)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="level">Level</Label>
                      <Select name="level" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input id="thumbnail" name="thumbnail" type="url" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is_published" name="is_published" />
                    <Label htmlFor="is_published">Publish immediately</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateCourseOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Course</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {courses.map((course) => (
                <Card key={course.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-1">{course.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                        {course.is_published ? (
                          <Badge variant="default">
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-muted-foreground">by {course.instructor.full_name}</div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.lessons[0]?.count || 0} lessons
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.enrollments[0]?.count || 0} enrolled
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(course.duration)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCourse(course)
                            setActiveTab("lessons")
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Manage Content
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateCourse(course.id, { is_published: !course.is_published })}
                        >
                          {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{course.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found. Create your first course to get started.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="h-full p-4 space-y-4">
          {selectedCourse ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-muted-foreground">Manage course content and lessons</p>
                </div>
                <Dialog open={createLessonOpen} onOpenChange={setCreateLessonOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Lesson</DialogTitle>
                      <DialogDescription>Add a new lesson to {selectedCourse.title}.</DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        handleCreateLesson(formData)
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="lesson-title">Lesson Title</Label>
                        <Input id="lesson-title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="lesson-description">Description</Label>
                        <Textarea id="lesson-description" name="description" required />
                      </div>
                      <div>
                        <Label htmlFor="video_url">Video URL</Label>
                        <Input id="video_url" name="video_url" type="url" />
                      </div>
                      <div>
                        <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                        <Input id="lesson-duration" name="duration" type="number" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="is_free" name="is_free" />
                        <Label htmlFor="is_free">Free preview lesson</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setCreateLessonOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Lesson</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4" />
                            <span className="font-medium">{lesson.title}</span>
                            {lesson.is_free && <Badge variant="secondary">Free</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{formatDuration(lesson.duration)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {lessons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No lessons added yet. Create your first lesson to get started.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a course to manage its content</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Course Analytics</h2>
            <Badge variant="outline">Last 30 days</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-primary">{courses.length}</div>
                <div className="text-sm text-muted-foreground">Total Courses</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {courses.reduce((sum, course) => sum + (course.enrollments[0]?.count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Enrollments</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Course Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground">{course.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{course.enrollments[0]?.count || 0}</div>
                      <div className="text-sm text-muted-foreground">enrollments</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
