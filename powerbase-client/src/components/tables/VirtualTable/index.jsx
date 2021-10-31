/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";

import { useViewFields } from "@models/ViewFields";
import { useTableConnections } from "@models/TableConnections";
import { useTableRecords } from "@models/TableRecords";
import { useFieldTypes } from "@models/FieldTypes";
import { ITable } from "@lib/propTypes/table";

import { Loader } from "@components/ui/Loader";
import { TableRenderer } from "./TableRenderer";

import "react-virtualized/styles.css";

export function VirtualTable({ height, table }) {
  const { data: fields } = useViewFields();
  const { data: connections } = useTableConnections();
  const { data: records } = useTableRecords();
  const { data: fieldTypes } = useFieldTypes();

  if (
    fields == null ||
    connections == null ||
    records == null ||
    fieldTypes == null
  ) {
    return <Loader style={{ height }} />;
  }

  return <TableRenderer height={height} table={table} />;
}

VirtualTable.propTypes = {
  height: PropTypes.number,
  table: ITable.isRequired,
};
