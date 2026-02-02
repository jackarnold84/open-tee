import { Button, DatePicker, Divider, Form, Input, InputNumber, Radio, Slider, Switch } from "antd"
import moment from "moment"
import * as React from "react"
import styled from "styled-components"

const holesOptions = [
  { label: "Any", value: 0 },
  { label: "9 Holes", value: 9 },
  { label: "18 Holes", value: 18 },
]

const playersOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
]

const FormSection = styled.div`
  margin-bottom: 32px;
`

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  gap: 8px;
`

const SectionIcon = styled.span`
  font-size: 18px;
`

const NameContainsList = styled.div``
const NameContainsRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`
const StyledInput = styled(Input)`
  flex: 1;
`
const RemoveButton = styled(Button)`
  margin-left: 8px;
`
const AddButton = styled(Button)`
  margin-top: 8px;
`
const DealsCard = styled.div`
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:hover {
    border-color: #1890ff;
  }
`
const DealsLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const DealsTitle = styled.span`
  font-weight: 600;
  font-size: 15px;
`
const DealsSubtitle = styled.span`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
`
const RemoveIcon = styled.span`
  font-weight: bold;
  font-size: 16px;
`
const SliderLabel = styled.div`
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-top: 8px;
  font-weight: 500;
`

export interface CreateAlertFormValues {
  date: any;
  zipCode: string;
  radius: number;
  holes: number;
  players: number;
  priceMax: number;
  dealsOnly: boolean;
  startHourRange: [number, number];
  ratingMin: number;
  nameContains: string[];
}

interface CreateAlertFormProps {
  onSubmit: (values: CreateAlertFormValues) => void;
  initialValues?: Partial<CreateAlertFormValues>;
  loading?: boolean;
}

export const CreateAlertForm: React.FC<CreateAlertFormProps> = ({ onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm()
  const [nameInputs, setNameInputs] = React.useState<string[]>(initialValues?.nameContains || [])

  React.useEffect(() => {
    form.setFieldsValue({ nameContains: nameInputs })
  }, [nameInputs])

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? moment(initialValues.date) : undefined,
        startHourRange: initialValues.startHourRange || [4, 22],
        ratingMin: initialValues.ratingMin ?? 0,
        nameContains: initialValues.nameContains || [],
      })
      setNameInputs(initialValues.nameContains || [])
    }
  }, [initialValues])

  const handleFinish = (values: any) => {
    const nameContains = nameInputs.filter(v => v.trim() !== "")
    const formatted = {
      ...values,
      nameContains,
      date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
      startHourMin: Array.isArray(values.startHourRange) ? values.startHourRange[0] : 4,
      startHourMax: Array.isArray(values.startHourRange) ? values.startHourRange[1] : 22,
    }
    onSubmit(formatted as CreateAlertFormValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      initialValues={{
        radius: 20,
        holes: 0,
        players: 1,
        dealsOnly: false,
        priceMin: 0,
        priceMax: 500,
        startHourMin: 6,
        startHourMax: 18,
        startHourRange: [6, 18],
        ratingMin: 1,
        nameContains: [],
        ...initialValues,
        date: initialValues?.date ? moment(initialValues.date) : undefined,
      }}
    >
      <FormSection>
        <SectionTitle>
          <SectionIcon>📅</SectionIcon>
          When & Where
        </SectionTitle>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="dddd, MMMM D"
            disabledDate={current => current && current.isBefore(moment().startOf('day'))}
            allowClear={false}
            inputReadOnly
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="zipCode"
          label="Zip Code"
          rules={[
            { required: true, message: "Please enter a zip code" },
            { len: 5, message: "Zip code must be 5 digits" },
            { pattern: /^\d{5}$/, message: "Zip code must be numeric" },
          ]}
        >
          <Input maxLength={5} size="large" inputMode="numeric" />
        </Form.Item>
        <Form.Item
          name="radius"
          label="Search Radius"
          rules={[
            { required: true, message: "Please enter a radius" },
            { type: "number", min: 1, max: 50, message: "Radius must be 1-50" },
          ]}
        >
          <InputNumber
            min={1}
            max={50}
            style={{ width: "100%" }}
            addonAfter="miles"
            size="large"
            inputMode="numeric"
          />
        </Form.Item>
        <Form.Item
          label="Start Time"
          name="startHourRange"
          rules={[{ required: true, message: "Please select a time range" }]}
        >
          <Form.Item noStyle name="startHourRange" initialValue={[4, 22]}>
            <Slider
              range
              min={4}
              max={22}
              step={1}
              marks={{}}
              tooltip={{
                formatter: (val?: number) => {
                  if (typeof val !== 'number') return ''
                  if (val === 12) return '12pm'
                  if (val === 0) return '12am'
                  if (val > 12) return `${val - 12}pm`
                  return `${val}am`
                }
              }}
            />
          </Form.Item>
          <Form.Item shouldUpdate={(prev, curr) => prev.startHourRange !== curr.startHourRange} noStyle>
            {() => {
              const range = form.getFieldValue('startHourRange') || [4, 22]
              const formatHour = (val: number) => {
                if (val === 12) return '12pm'
                if (val === 0) return '12am'
                if (val > 12) return `${val - 12}pm`
                return `${val}am`
              }
              return (
                <SliderLabel>
                  {formatHour(range[0])} - {formatHour(range[1])}
                </SliderLabel>
              )
            }}
          </Form.Item>
        </Form.Item>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>
          <SectionIcon>🏌️</SectionIcon>
          Game Details
        </SectionTitle>
        <Form.Item
          name="holes"
          label="Holes"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid" style={{ display: 'flex', width: '100%' }}>
            {holesOptions.map(option => (
              <Radio.Button
                key={option.value}
                value={option.value}
                style={{ flex: 1, textAlign: 'center' }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="players"
          label="Players"
          rules={[
            { required: true },
            { type: "number", min: 1, max: 4, message: "Players must be 1-4" },
          ]}
        >
          <Radio.Group buttonStyle="solid" style={{ display: 'flex', width: '100%' }}>
            {playersOptions.map(option => (
              <Radio.Button
                key={option.value}
                value={option.value}
                style={{ flex: 1, textAlign: 'center' }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>
          <SectionIcon>💰</SectionIcon>
          Price
        </SectionTitle>
        <Form.Item
          name="priceMax"
          label="Maximum Price"
          dependencies={["priceMin"]}
          rules={[
            { type: "number", min: 0, message: "Max price must be >= 0" },
          ]}
        >
          <InputNumber min={0} style={{ width: "100%" }} addonBefore="$" size="large" inputMode="numeric" placeholder="500" />
        </Form.Item>
        <DealsCard>
          <DealsLabel>
            <DealsTitle>Deals Only</DealsTitle>
            <DealsSubtitle>Show only discounted tee times</DealsSubtitle>
          </DealsLabel>
          <Form.Item name="dealsOnly" valuePropName="checked" noStyle>
            <Switch size="default" />
          </Form.Item>
        </DealsCard>
      </FormSection>

      <Divider />

      <FormSection>
        <SectionTitle>
          <SectionIcon>⛳</SectionIcon>
          Course Preferences
        </SectionTitle>
        <Form.Item
          name="ratingMin"
          label="Rating"
          rules={[{ type: "number", min: 0, max: 5, message: "Rating must be 0-5" }]}
        >
          <Form.Item noStyle name="ratingMin" initialValue={0}>
            <Slider
              min={0}
              max={5}
              step={0.1}
              marks={{}}
              tooltip={{
                formatter: (val?: number) => val !== undefined ? `${val.toFixed(1)} ⭐` : ''
              }}
            />
          </Form.Item>
          <Form.Item shouldUpdate={(prev, curr) => prev.ratingMin !== curr.ratingMin} noStyle>
            {() => {
              const value = form.getFieldValue('ratingMin') ?? 0
              return (
                <SliderLabel>{value.toFixed(1)} stars and above</SliderLabel>
              )
            }}
          </Form.Item>
        </Form.Item>
        <Form.Item label="Filter by Course Name (optional)" required={false}>
          <NameContainsList>
            {nameInputs.map((val, idx) => (
              <NameContainsRow key={idx}>
                <StyledInput
                  value={val}
                  placeholder="e.g. Pine Lakes"
                  size="large"
                  onChange={e => {
                    const arr = [...nameInputs]
                    arr[idx] = e.target.value
                    setNameInputs(arr)
                  }}
                />
                <RemoveButton
                  danger
                  type="text"
                  shape="circle"
                  icon={<RemoveIcon>×</RemoveIcon>}
                  onClick={() => setNameInputs(inputs => inputs.filter((_, i) => i !== idx))}
                  aria-label="Remove"
                />
              </NameContainsRow>
            ))}
            <AddButton
              type="dashed"
              onClick={() => setNameInputs(inputs => [...inputs, ""])}
              block
            >
              + Add Course Name
            </AddButton>
          </NameContainsList>
        </Form.Item>
      </FormSection>

      <Form.Item style={{ marginTop: 32 }}>
        <Button type="primary" htmlType="submit" size="large" style={{ width: "100%" }} loading={loading}>
          Next
        </Button>
      </Form.Item>
    </Form>
  )
}
