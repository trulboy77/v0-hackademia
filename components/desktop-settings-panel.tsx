"use client"

import { useState } from "react"
import { Settings, Grid, AtSign as Align } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useDesktopStore } from "@/stores/desktop-store"
import { useWindowManagerStore } from "@/stores/window-manager-store"

export function DesktopSettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    desktopSnapToGrid,
    desktopGridSize,
    showDesktopGrid,
    autoArrangeIcons,
    setDesktopSnapToGrid,
    setDesktopGridSize,
    setShowDesktopGrid,
    setAutoArrangeIcons,
    arrangeIconsInGrid,
  } = useDesktopStore()

  const {
    snapToGrid: windowSnapToGrid,
    gridSize: windowGridSize,
    showDock,
    dockPosition,
    setSnapToGrid: setWindowSnapToGrid,
    setGridSize: setWindowGridSize,
    setShowDock,
    setDockPosition,
  } = useWindowManagerStore()

  return (
    <div className="fixed top-16 right-4 z-40">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-secondary/90 backdrop-blur-sm border-border hover:bg-secondary"
          >
            <Settings className="w-4 h-4 mr-2" />
            Desktop Settings
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-secondary/95 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Desktop & Window Settings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Desktop Icon Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  Desktop Icons
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop-snap" className="text-sm">
                      Snap to Grid
                    </Label>
                    <Switch id="desktop-snap" checked={desktopSnapToGrid} onCheckedChange={setDesktopSnapToGrid} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid" className="text-sm">
                      Show Grid
                    </Label>
                    <Switch id="show-grid" checked={showDesktopGrid} onCheckedChange={setShowDesktopGrid} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Grid Size: {desktopGridSize}px</Label>
                    <Slider
                      value={[desktopGridSize]}
                      onValueChange={([value]) => setDesktopGridSize(value)}
                      min={50}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-arrange" className="text-sm">
                      Auto Arrange
                    </Label>
                    <Switch id="auto-arrange" checked={autoArrangeIcons} onCheckedChange={setAutoArrangeIcons} />
                  </div>

                  <Button onClick={arrangeIconsInGrid} size="sm" variant="outline" className="w-full bg-transparent">
                    <Align className="w-4 h-4 mr-2" />
                    Arrange Icons
                  </Button>
                </div>
              </div>

              {/* Window Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Windows
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="window-snap" className="text-sm">
                      Window Snap to Grid
                    </Label>
                    <Switch id="window-snap" checked={windowSnapToGrid} onCheckedChange={setWindowSnapToGrid} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Window Grid Size: {windowGridSize}px</Label>
                    <Slider
                      value={[windowGridSize]}
                      onValueChange={([value]) => setWindowGridSize(value)}
                      min={10}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-dock" className="text-sm">
                      Show Dock
                    </Label>
                    <Switch id="show-dock" checked={showDock} onCheckedChange={setShowDock} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Dock Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["bottom", "top", "left", "right"] as const).map((position) => (
                        <Button
                          key={position}
                          onClick={() => setDockPosition(position)}
                          size="sm"
                          variant={dockPosition === position ? "default" : "outline"}
                          className="capitalize"
                        >
                          {position}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
