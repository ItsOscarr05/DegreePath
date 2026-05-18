"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { saveOnboarding, type OnboardingFormState } from "./actions";

interface CatalogOption {
  universityId: string;
  universityName: string;
  majorId: string;
  majorName: string;
  catalogYear: number;
}

const initialState: OnboardingFormState = undefined;

export function OnboardingForm({ catalogs }: { catalogs: CatalogOption[] }) {
  const [state, action, pending] = useActionState(saveOnboarding, initialState);
  const first = catalogs[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic profile</CardTitle>
        <CardDescription>
          We currently support {catalogs.length} program. More are coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="universityId">University</Label>
            <Select
              id="universityId"
              name="universityId"
              defaultValue={first?.universityId}
              required
            >
              {catalogs.map((c) => (
                <option key={c.universityId} value={c.universityId}>
                  {c.universityName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="majorId">Major</Label>
            <Select id="majorId" name="majorId" defaultValue={first?.majorId} required>
              {catalogs.map((c) => (
                <option key={c.majorId} value={c.majorId}>
                  {c.majorName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minorId">Minor (optional)</Label>
            <Input id="minorId" name="minorId" placeholder="e.g. Mathematics" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="catalogYear">Catalog year</Label>
              <Select
                id="catalogYear"
                name="catalogYear"
                defaultValue={String(first?.catalogYear)}
                required
              >
                {catalogs.map((c) => (
                  <option key={c.catalogYear} value={c.catalogYear}>
                    {c.catalogYear}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedGraduationYear">
                Expected graduation
              </Label>
              <Input
                id="expectedGraduationYear"
                name="expectedGraduationYear"
                type="number"
                min={2024}
                max={2040}
                placeholder="2028"
              />
            </div>
          </div>
          {state?.error ? (
            <p className="rounded-md border border-north/40 bg-north/10 px-3 py-2 text-sm text-north">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="north" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
