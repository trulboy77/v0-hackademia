"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Search, Plus, Users, Clock, Star, Edit, Trash2 } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number // in hours
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  price: number
  enrolled: number
  rating: number
  thumbnail: string
  status: "active" | "draft" | "archived"
  createdAt: Date
  updatedAt: Date
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Cybersecurity Fundamentals",
    description:
      "Learn the basics of cybersecurity, including threat analysis, risk management, and security protocols.",
    instructor: "Dr. Ahmad Karimov",
    duration: 40,
    level: "Beginner",
    category: "Security",
    price: 299000, // in UZS
    enrolled: 156,
    rating: 4.8,
    thumbnail: "/cybersecurity-course.png",
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "2",
    title: "Advanced Penetration Testing",
    description:
      "Master advanced penetration testing techniques and methodologies used by professional security testers.",
    instructor: "Sardor Abdullayev",
    duration: 60,
    level: "Advanced",
    category: "Penetration Testing",
    price: 599000,
    enrolled: 89,
    rating: 4.9,
    thumbnail: "/penetration-testing-course.jpg",
    status: "active",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "3",
    title: "Web Application Security",
    description: "Comprehensive course on securing web applications against common vulnerabilities and attacks.",
    instructor: "Malika Toshmatova",
    duration: 35,
    level: "Intermediate",
    category: "Web Security",
    price: 399000,
    enrolled: 234,
    rating: 4.7,
    thumbnail: "/web-security-course.png",
    status: "active",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-03-05"),
  },
]

export function Kurslar() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("browse")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true) // Mock admin status
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    duration: 0,
    level: "Beginner" as const,
    category: "",
    price: 0,
  })

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory

    return matchesSearch && matchesLevel && matchesCategory
  })

  const levels = ["all", "Beginner", "Intermediate", "Advanced"]
  const categories = ["all", ...Array.from(new Set(courses.map((course) => course.category)))]

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "archived":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleAddCourse = () => {
    if (newCourse.title && newCourse.description && newCourse.instructor) {
      const course: Course = {
        id: Date.now().toString(),
        ...newCourse,
        enrolled: 0,
        rating: 0,
        thumbnail: "/course-thumbnail.png",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCourses([course, ...courses])
      setNewCourse({
        title: "",
        description: "",
        instructor: "",
        duration: 0,
        level: "Beginner",
        category: "",
        price: 0,
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId))
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          {isAdmin && <TabsTrigger value="manage">Manage Courses</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Kurslar (Courses)</h1>
            <Badge variant="outline">{filteredCourses.length} courses</Badge>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level === "all" ? "All Levels" : level}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                      <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-muted-foreground">by {course.instructor}</div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrolled}
                      </span>
                      {course.rating > 0 && (
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {course.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <span className="text-lg font-bold text-primary">{formatPrice(course.price)}</span>
                    </div>
                    <Button size="sm">Enroll Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="manage" className="h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Courses</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>Create a new course for the platform</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder="Enter course title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder="Enter course description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Input
                          id="instructor"
                          value={newCourse.instructor}
                          onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                          placeholder="Instructor name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newCourse.category}
                          onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                          placeholder="Course category"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newCourse.duration}
                          onChange={(e) =>
                            setNewCourse({ ...newCourse, duration: Number.parseInt(e.target.value) || 0 })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <select
                          id="level"
                          value={newCourse.level}
                          onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value as any })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (UZS)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCourse}>Add Course</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>by {course.instructor}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{course.enrolled}</div>
                        <div className="text-muted-foreground">Enrolled</div>
                      </div>
                      <div>
                        <div className="font-medium">{formatPrice(course.price)}</div>
                        <div className="text-muted-foreground">Price</div>
                      </div>
                      <div>
                        <div className="font-medium">{course.duration}h</div>
                        <div className="text-muted-foreground">Duration</div>
                      </div>
                      <div>
                        <div className="font-medium">{formatDate(course.updatedAt)}</div>
                        <div className="text-muted-foreground">Updated</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
