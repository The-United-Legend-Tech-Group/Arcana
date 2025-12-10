"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import SectionHeading from "./SectionHeading";
import { ScheduleRule, SectionDefinition, ShiftDefinition } from "./types";

type PolicyRulesSectionProps = {
  section: SectionDefinition;
  shifts: ShiftDefinition[];
  scheduleRules: ScheduleRule[];
  loading: boolean;
};

function parsePattern(pattern?: string) {
  if (!pattern) return null;
  try {
    return JSON.parse(pattern);
  } catch (error) {
    return pattern;
  }
}

export default function PolicyRulesSection({
  section,
  shifts,
  scheduleRules,
  loading,
}: PolicyRulesSectionProps) {
  const activeShifts = React.useMemo(
    () => shifts.filter((shift) => shift.active !== false),
    [shifts]
  );

  const approvalRequired = React.useMemo(
    () =>
      activeShifts.filter((shift) => shift.requiresApprovalForOvertime).length,
    [activeShifts]
  );

  return (
    <Box>
      <SectionHeading {...section} />
      <Card variant="outlined">
        <CardContent>
          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="text" width={240} height={32} />
              <Skeleton variant="rounded" height={220} />
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="stretch"
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Shift templates
                </Typography>
                {activeShifts.length === 0 ? (
                  <Alert severity="info">
                    No active shifts configured yet.
                  </Alert>
                ) : (
                  <List dense disablePadding>
                    {activeShifts.slice(0, 6).map((shift) => (
                      <ListItem
                        key={shift._id}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography fontWeight="bold">
                                {shift.name}
                              </Typography>
                              {shift.requiresApprovalForOvertime && (
                                <Chip
                                  size="small"
                                  label="Approval needed"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                              {shift.punchPolicy && (
                                <Chip
                                  size="small"
                                  label={shift.punchPolicy}
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {shift.startTime} → {shift.endTime} · Grace{" "}
                              {shift.graceInMinutes ?? 0}m /{" "}
                              {shift.graceOutMinutes ?? 0}m
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Chip
                    color="info"
                    label={`${activeShifts.length} active templates`}
                    variant="outlined"
                  />
                  <Chip
                    color="warning"
                    label={`${approvalRequired} need overtime approval`}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  Schedule rules
                </Typography>
                {scheduleRules.length === 0 ? (
                  <Alert severity="info">
                    No schedule rules have been published.
                  </Alert>
                ) : (
                  <List dense disablePadding>
                    {scheduleRules.slice(0, 6).map((rule) => {
                      const pattern = parsePattern(rule.pattern);
                      return (
                        <ListItem
                          key={rule._id}
                          sx={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                          >
                            <Typography fontWeight="bold">
                              {rule.name}
                            </Typography>
                            <Chip
                              size="small"
                              color={
                                rule.active === false ? "default" : "success"
                              }
                              label={
                                rule.active === false ? "Inactive" : "Active"
                              }
                              variant="outlined"
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ width: "100%" }}
                          >
                            {typeof pattern === "string"
                              ? pattern
                              : JSON.stringify(pattern, null, 0)}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
