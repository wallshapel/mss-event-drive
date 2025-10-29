// src/components/OrdersTable.tsx
import { useApi } from "../contexts/ApiContext";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  Pagination,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

export default function OrdersTable() {
  const {
    orders,
    page,
    totalPages,
    refreshOrders,
    highlightedOrders,
    clearHighlight,
  } = useApi();

  const handlePageChange = async (
    _: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    await refreshOrders(newPage);
  };

  // 🧩 Al hacer clic en una fila sombreada, se marca como leída y se actualiza localStorage
  const handleRowClick = (orderId: string, isHighlighted: boolean) => {
    if (isHighlighted) {
      clearHighlight(orderId);
    }
  };

  if (orders.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 3, textAlign: "center" }}>
        No hay órdenes registradas aún.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>ID</b>
              </TableCell>
              <TableCell>
                <b>Descripción</b>
              </TableCell>
              <TableCell>
                <b>Monto</b>
              </TableCell>
              <TableCell>
                <b>Estado</b>
              </TableCell>
              <TableCell>
                <b>Creado</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const isHighlighted = highlightedOrders.has(order.id);

              return (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => handleRowClick(order.id, isHighlighted)}
                  sx={{
                    cursor: isHighlighted ? "pointer" : "default",
                    backgroundColor: isHighlighted
                      ? "rgba(25,118,210,0.1)"
                      : "transparent",
                    transition: "background-color 0.3s ease",
                    "& td": { fontWeight: isHighlighted ? 600 : 400 },
                  }}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>${order.amount}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          order.status === "PAID"
                            ? "green"
                            : order.status === "FAILED"
                            ? "red"
                            : "orange",
                      }}
                    >
                      {order.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {dayjs(order.created_at).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🧭 Paginador dinámico */}
      <Stack alignItems="center" sx={{ mt: 2, mb: 1 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
      </Stack>
    </>
  );
}
