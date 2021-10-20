/* eslint-disable */
import React, { useState } from "react";
import cn from "classnames";
import { CheckIcon, ExclamationIcon } from "@heroicons/react/outline";

import { useValidState } from "@lib/hooks/useValidState";
import { REQUIRED_VALIDATOR } from "@lib/validators/REQUIRED_VALIDATOR";
import { SQL_IDENTIFIER_VALIDATOR } from "@lib/validators/SQL_IDENTIFIER_VALIDATOR";
import { updateDatabase } from "@lib/api/databases";
import { DATABASE_TYPES, POWERBASE_TYPE } from "@lib/constants";
import { useBase } from "@models/Base";
import { useBases } from "@models/Bases";

import { Button } from "@components/ui/Button";
import { InlineColorRadio } from "@components/ui/InlineColorRadio";
import { InlineInput } from "@components/ui/InlineInput";
import { InlineRadio } from "@components/ui/InlineRadio";
import { InlineSelect } from "@components/ui/InlineSelect";
import { StatusModal } from "@components/ui/StatusModal";

const INITIAL_MODAL_VALUE = {
  open: false,
  icon: (
    <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
    </div>
  ),
  title: "Update Successful",
  content: "The database's information has been updated.",
};

const ERROR_ICON = (
  <div className="mx-auto mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
  </div>
);

export function BaseCoreSettings() {
  const { data: base, mutate: mutateBase } = useBase();
  const { mutate: mutateBases } = useBases();

  const [name, setName, nameError] = useValidState(
    base.name,
    REQUIRED_VALIDATOR
  );
  const [databaseName, setDatabaseName, databaseNameError] = useValidState(
    base.databaseName,
    SQL_IDENTIFIER_VALIDATOR
  );
  const [databaseType, setDatabaseType] = useState(DATABASE_TYPES[0]);
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [powerbaseType, setPowerbaseType] = useState(
    POWERBASE_TYPE[base.isTurbo ? 0 : 1]
  );
  const [color, setColor, colorError] = useValidState(base.color);

  const [modal, setModal] = useState(INITIAL_MODAL_VALUE);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setModal(INITIAL_MODAL_VALUE);

    if (!color.length) {
      colorError.setError(new Error("Required"));
      setLoading(false);
      return;
    }

    try {
      const response = await updateDatabase({
        id: base.id,
        name,
        database: databaseName,
        host,
        port,
        username,
        password,
        color,
      });

      if (!response.connected || response.isExisting) {
        setModal({
          open: true,
          icon: ERROR_ICON,
          title: "Update Failed",
          content: response.isExisting
            ? `Database with name of "${response.database.name}" already exists in this account.`
            : `Couldn't connect to "${name}". Please check the information given if they are correct.`,
        });
      } else {
        setModal((curVal) => ({ ...curVal, open: true }));
        await mutateBase();
        await mutateBases();
      }
    } catch (err) {
      setModal({
        open: true,
        icon: ERROR_ICON,
        title: "Update Failed",
        content:
          err?.response?.data.exception ||
          "Something went wrong. Please try again later.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="py-6 px-4 sm:p-6 lg:pb-8">
      <h2 className="text-xl leading-6 font-medium text-gray-900">
        Core Settings
      </h2>
      <form onSubmit={handleSubmit}>
        <h3 className="mt-4 text-lg font-medium text-gray-900">General Info</h3>
        <InlineInput
          type="text"
          label="Name"
          name="name"
          placeholder="e.g. Powerbase or Field Projects"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
          error={nameError.error}
          className="my-6"
          required
        />
        <InlineSelect
          label="Type"
          value={databaseType}
          setValue={setDatabaseType}
          options={DATABASE_TYPES}
          className="my-6"
          disabled
        />
        <InlineRadio
          label="Powerbase Type"
          value={powerbaseType}
          setValue={setPowerbaseType}
          options={POWERBASE_TYPE}
          className="my-6"
          disabled
        />
        <InlineColorRadio
          value={color}
          setValue={setColor}
          error={colorError.error}
          setError={colorError.setError}
          className="my-6"
        />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Connection String
        </h3>
        <p className="text-sm text-gray-500 my-1">
          You may leave this section blank if you do not wish to update the
          connection.
          <br />
          {base.isTurbo && (
            <>
              Updating the connection string is an <strong>irreversible</strong>{" "}
              action. Please check your inputs carefully.
            </>
          )}
        </p>
        <InlineInput
          type="text"
          label="Database Name"
          name="database-name"
          placeholder="e.g. powerbase or field_projects"
          value={databaseName}
          onChange={(evt) => setDatabaseName(evt.target.value)}
          error={databaseNameError.error}
          className="my-6"
        />
        <InlineInput
          type="text"
          label="Host"
          name="host"
          placeholder="e.g. 127.0.0.1"
          value={host}
          onChange={(evt) => setHost(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="number"
          label="Port"
          name="port"
          placeholder="e.g. 5432"
          value={port}
          onChange={(evt) => setPort(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="text"
          label="Username"
          name="username"
          placeholder="e.g. postgres"
          value={username}
          onChange={(evt) => setUsername(evt.target.value)}
          className="my-6"
        />
        <InlineInput
          type="password"
          label="Password"
          name="password"
          placeholder="e.g. ******"
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          className="my-6"
        />
        <div className="mt-4 py-4 border-t border-solid flex justify-end">
          <Button
            type="submit"
            className={cn(
              "bg-sky-700 ml-5 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
              databaseName.length && "hover:bg-sky-800",
              !databaseName.length && "cursor-not-allowed"
            )}
            loading={loading}
            disabled={!databaseName.length}
          >
            Update Database
          </Button>
        </div>
      </form>
      <StatusModal
        open={modal.open}
        setOpen={(value) => setModal((curVal) => ({ ...curVal, open: value }))}
        icon={modal.icon}
        title={modal.title}
        handleClick={() => setModal((curVal) => ({ ...curVal, open: false }))}
      >
        {modal.content}
      </StatusModal>
    </div>
  );
}
