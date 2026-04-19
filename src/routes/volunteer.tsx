import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/volunteer")({
  component: VolunteerLayout,
});

function VolunteerLayout() {
  return (
    <div className="volunteer-layout">
      <Outlet />
    </div>
  );
}
