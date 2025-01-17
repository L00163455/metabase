import React from "react";
import { render, screen } from "@testing-library/react";
import { createMockCollection } from "metabase-types/api/mocks";
import TimelineEmptyState, {
  TimelineEmptyStateProps,
} from "./TimelineEmptyState";

describe("TimelineEmptyState", () => {
  it("should allow event creation for users with write access", () => {
    const props = getProps({
      collection: createMockCollection({
        can_write: true,
      }),
    });

    render(<TimelineEmptyState {...props} />);

    const button = screen.getByRole("button", { name: "Add an event" });
    expect(button).toBeInTheDocument();
  });

  it("should not allow event creation for users without write access", () => {
    const props = getProps({
      collection: createMockCollection({
        can_write: false,
      }),
    });

    render(<TimelineEmptyState {...props} />);

    const button = screen.queryByRole("button", { name: "Add an event" });
    expect(button).not.toBeInTheDocument();
  });
});

const getProps = (
  opts?: Partial<TimelineEmptyStateProps>,
): TimelineEmptyStateProps => ({
  collection: createMockCollection(),
  onNewEventWithTimeline: jest.fn(),
  ...opts,
});
