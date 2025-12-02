"use client";

import { WarningAlt } from "@/components/svgs";
import TablePagination from "@/components/table/pagination";
import { RowMenu } from "@/components/table/pagination/callout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProviders } from "@/lib/api/provider";
import { slugify } from "@/lib/utils";
import { FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteProvider } from "./delete";
import EditProvider from "./edit";

interface ProviderRow {
  id: string;
  providerId: string;
  provider_id?: string;
  name: string;
  state: string;
  channels: string[];
  tariffUpdatedAt: string;
  needsTariff: boolean;
  needsChannels: boolean;
}

interface ProvidersTableProps {
  query: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function ProvidersTable({
  query,
  page,
  onPageChange,
}: ProvidersTableProps) {
  const router = useRouter();
  const pageSize = 20;

  const { data, isLoading, error } = useProviders({
    page,
    limit: pageSize,
    search: query,
  });

  const controlsId = "providers-table-body";

  const rawRows = (data?.data ?? []) as Array<{ [key: string]: any }>;
  const rows: ProviderRow[] = rawRows.map((row) => {
    const name = row.name ?? row.provider_name ?? "Unnamed Provider";
    const providerId = row.provider_id ?? `${row.id}`;
    const state = row.state_name ?? row.state ?? "—";
    const channels: string[] = Array.isArray(row.channels) ? row.channels : [];
    const tariffUpdatedAt: string = row.tariff_updated_at ?? "—";

    const needsTariff = !row.tariff_updated_at;
    const needsChannels = !channels.length;

    return {
      id: String(row.id),
      providerId,
      name,
      state,
      channels,
      tariffUpdatedAt,
      needsTariff,
      needsChannels,
    };
  });

  const totalItems = data?.pagination?.total ?? rows.length;

  const handleViewProvider = (provider: ProviderRow) => {
    if (!provider.id) return;
    const encoded = encodeURIComponent(provider.id);
    router.push(`/admin/providers/${slugify(provider.name)}?pid=${encoded}`);
  };

  const handleSetupTariff = (provider: ProviderRow) => {
    if (!provider.id) return;
    const encoded = encodeURIComponent(provider.id);
    router.push(
      `/admin/providers/${slugify(provider.name)}?pid=${encoded}&tab=tariff`,
    );
  };

  const handleSetupChannels = (provider: ProviderRow) => {
    if (!provider.id) return;
    const encoded = encodeURIComponent(provider.id);
    router.push(
      `/admin/providers/${slugify(provider.name)}?pid=${encoded}&tab=channels`,
    );
  };

  return (
    <div className="w-full">
      <TableContainer>
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Provider</TableHead>
              <TableHead className="w-[10%]">Provider ID</TableHead>
              <TableHead className="w-[20%]">Tariff Update</TableHead>
              <TableHead className="w-[10%]">State</TableHead>
              <TableHead className="w-[30%]">Channels</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody id={controlsId}>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading providers…
                </TableCell>
              </TableRow>
            )}

            {error && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-red-600"
                >
                  Failed to load providers
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {query
                    ? `No providers match “${query}”.`
                    : "No providers found."}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-[#F9FAFB]">
                  {/* Provider cell */}
                  <TableCell className="pl-6">
                    <div className="truncate text-[14px]/[20px] font-medium text-[#101828]">
                      {row.name}
                    </div>
                  </TableCell>

                  {/* Provider ID cell */}
                  <TableCell className="pl-6">
                    <div className="truncate text-[14px]/[20px] font-medium text-[#101828]">
                      {row.providerId}
                    </div>
                  </TableCell>

                  {/* Tariff */}
                  <TableCell className="align-middle">
                    {row.needsTariff ? (
                      <InlineAlert onClick={() => handleSetupTariff(row)}>
                        Set up tariff
                      </InlineAlert>
                    ) : (
                      row.tariffUpdatedAt
                    )}
                  </TableCell>

                  {/* State */}
                  <TableCell className="align-middle">{row.state}</TableCell>

                  {/* Channels */}
                  <TableCell className="align-middle">
                    {row.needsChannels ? (
                      <InlineAlert onClick={() => handleSetupChannels(row)}>
                        Set up channels
                      </InlineAlert>
                    ) : row.channels.length ? (
                      row.channels.join(", ")
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right pr-6">
                    <RowMenu
                      items={[
                        {
                          type: "button",
                          button: (
                            <Button
                              variant="outline"
                              className="w-full h-10 rounded-xl border-0 py-2.5 px-3.5 flex justify-start items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]"
                              onClick={() => handleViewProvider(row)}
                            >
                              <FileText /> View detail
                            </Button>
                          ),
                        },
                        "separator",
                        {
                          type: "button",
                          button: <EditProvider provider={row} />,
                        },
                        "separator",
                        {
                          type: "action",
                          label: (
                            <span className="w-full h-10 rounded-xl border-0 py-2.5 px-3.5 flex justify-start items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]">
                              <User />
                              Tariff plan
                            </span>
                          ),
                          onSelect: () => handleSetupTariff(row),
                        },
                        "separator",
                        {
                          type: "action",
                          label: (
                            <span className="w-full h-10 rounded-xl border-0 py-2.5 px-3.5 flex justify-start items-center gap-2 bg-transparent text-[#344054] text-[14px]/[20px] tracking-normal font-semibold hover:bg-primary/5 hover:text-[#344054]">
                              <User />
                              Channels
                            </span>
                          ),
                          onSelect: () => handleSetupChannels(row),
                        },
                        "separator",
                        {
                          type: "button",
                          button: <DeleteProvider provider={row} />,
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        page={page}
        onPageChange={onPageChange}
        totalItems={totalItems}
        pageSize={pageSize}
        boundaryCount={1}
        siblingCount={1}
        controlsId={controlsId}
      />
    </div>
  );
}

/* -------- Helpers -------- */
function InlineAlert({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-start gap-2 rounded-full text-[14px]/[20px] font-hnd font-medium text-[#FF6058]";

  if (!onClick) {
    return (
      <span className={base}>
        <WarningAlt />
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} cursor-pointer hover:underline`}
    >
      <WarningAlt />
      {children}
    </button>
  );
}
