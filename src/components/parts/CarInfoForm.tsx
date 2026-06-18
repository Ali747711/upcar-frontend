import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { CarInfo } from "@/types/part"

interface CarInfoFormProps {
  value: CarInfo
  onChange: (value: CarInfo) => void
}

export function CarInfoForm({ value, onChange }: CarInfoFormProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <FieldGroup className="@md/field-group:flex-row">
          <Field>
            <FieldLabel htmlFor="car-name">Car Name</FieldLabel>
            <Input
              id="car-name"
              placeholder="Hyundai Sonata"
              value={value.carName}
              onChange={(event) =>
                onChange({ ...value, carName: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="car-number">Car Number</FieldLabel>
            <Input
              id="car-number"
              placeholder="DN8 2020"
              value={value.carNumber}
              onChange={(event) =>
                onChange({ ...value, carNumber: event.target.value })
              }
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
