import React from 'react'

export default function BookingModal() {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
          <DialogDescription>Confirm your appointment details with {therapist.displayName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-md">
            <CalendarClock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{format(new Date(slot.date), "EEEE, MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">{slot.time}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Session Type</Label>
            <RadioGroup value={sessionType} onValueChange={setSessionType} className="flex flex-col space-y-1">
              {(therapist.sessionTypes || ["Video", "Phone", "In-person"]).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific concerns or topics you'd like to discuss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading}>
            {loading ? "Booking..." : "Request Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
