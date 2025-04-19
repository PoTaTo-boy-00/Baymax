"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

const specialtiesList = [
  "Anxiety",
  "Depression",
  "Trauma",
  "Relationships",
  "Addiction",
  "Grief",
  "Stress",
  "LGBTQ+",
  "Family",
  "Career",
];

export const GetTherapist = () => {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const therapistsQuery = query(
          collection(db, "users"),
          where("role", "==", "therapist")
        );
        const snapshot = await getDocs(therapistsQuery);

        const therapistsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          therapistsList.push({
            id: doc.id,
            displayName: data.displayName || "Unknown Therapist",
            specialties: data.specialties || [],
            bio: data.bio || "No bio available",
            photoURL: data.photoURL || null,
          });
        });

        setTherapists(therapistsList);
        setFilteredTherapists(therapistsList);
      } catch (error) {
        console.error("Error fetching therapists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    let filtered = therapists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((therapist) =>
        therapist.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty && selectedSpecialty !== "all") {
      filtered = filtered.filter((therapist) =>
        therapist.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredTherapists(filtered);
  }, [searchTerm, selectedSpecialty, therapists]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Therapist</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialtiesList.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTherapists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
              <Card key={therapist.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl font-medium text-primary">
                        {therapist.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {therapist.displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground">Therapist</p>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3 mb-4">{therapist.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {therapist.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                    {therapist.specialties.length > 3 && (
                      <Badge variant="outline">
                        +{therapist.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Link to={`/get-therapist/${therapist.id}`}>
                    <Button className="w-full">View Profile & Book</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No therapists found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
