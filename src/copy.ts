// All user-facing wording lives in this one file, so it can be edited
// without touching any layout or math code.

export const copy = {
  appName: "ToyMatch Time & Value Calculator",
  title: "Is ToyMatch worth it for you?",
  description:
    "Estimate how much time you could save on birthday gift shopping and compare its value with the annual subscription.",
  assumptionNotice:
    "The starting values are planning estimates. Adjust them to match your experience.",

  inputsHeading: "Your shopping habits",
  resultsHeading: "Your estimate",

  fields: {
    giftOccasions: {
      label: "How many more gifts will you shop for?",
      unitAfter: "gifts",
      help: "Count the occasions you expect to use ToyMatch during the next 12 months. Exclude your free introductory search.",
    },
    usualMinutes: {
      label: "How long does shopping usually take per gift?",
      unitAfter: "minutes",
      help: "Include research, comparing toys, choosing a retailer, and checkout. Count active time, not delivery time.",
    },
    toyMatchMinutes: {
      label: "How long do you expect shopping with ToyMatch to take?",
      unitAfter: "minutes",
      help: "Include entering details, reviewing recommendations, comparing options, and retailer checkout.",
      note: "The 42.5-minute example assumes half of 45 research minutes are avoided, with five minutes of app effort added.",
    },
    hourlyValue: {
      label: "What is one hour saved worth to you?",
      unitBefore: "$",
      unitAfter: "per hour",
      help: "Optional. Enter your personal value of time. This does not need to equal your hourly wage.",
    },
    additionalAnnualMinutes: {
      label: "Additional annual setup or management time",
      unitAfter: "minutes",
      help: "Add time spent downloading, learning, or managing the subscription that is not already included above.",
      note: "Leave at 0 to exclude this cost from the estimate.",
    },
    subscriptionCost: {
      label: "Annual subscription cost",
      unitBefore: "$",
      help: "ToyMatch's proposed annual price. Adjust this amount if applicable tax increases your cost.",
    },
  },

  adjustCosts: "Adjust costs",
  resetButton: "Reset example",

  errors: {
    required: "Enter a value.",
    notNumber: "Enter a number.",
    notWholeNumber: "Enter a whole number.",
    negative: "Enter 0 or more.",
  },

  results: {
    timeSavedLabel: "Estimated annual time saved",
    extraTimeLabel: "Estimated extra time required",
    timeValueLabel: "Estimated value of your time saved",
    subscriptionLabel: "Annual subscription cost",
    netValueLabel: "Estimated net value",
    disclaimer:
      "Dollar estimates represent your personal value of time, not cash savings. Actual results may differ.",
    messagePositive:
      "Based on your inputs, the estimated time value exceeds the annual subscription cost.",
    messageZero:
      "Based on your inputs, the estimated time value equals the annual subscription cost.",
    messageNegative:
      "Based on your inputs, the estimated time value does not cover the annual subscription cost.",
    addHourlyPrompt:
      "Add what an hour is worth to you to compare your time savings with the subscription cost.",
    incomplete: "Complete the highlighted fields to see your estimate.",
  },

  howCalculated: {
    summary: "How this is calculated",
    formulas: [
      {
        name: "Annual time saved in minutes",
        formula:
          "Gift occasions × (Usual time per gift − ToyMatch time per gift) − Additional annual effort",
      },
      { name: "Annual time saved in hours", formula: "Annual minutes saved ÷ 60" },
      {
        name: "Estimated time value",
        formula: "Annual hours saved × Personal hourly value",
      },
      {
        name: "Estimated net value",
        formula: "Estimated time value − Annual subscription cost",
      },
    ],
    assumptionsHeading: "Assumptions",
    assumptions: [
      "The free introductory search is excluded.",
      "Each counted occasion is assumed to use ToyMatch.",
      "App effort and retailer checkout are already included in the entered ToyMatch time.",
      "Toy purchase costs are assumed equal between methods.",
      "Confidence, gift suitability, and possible retailer discounts are not assigned dollar values.",
    ],
  },
} as const;
