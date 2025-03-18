import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import React, { useCallback, useMemo, useState } from "react";

import SurfaceButton from "src/components/buttons/surfaceButton";
import TextButton from "src/components/buttons/textButton";
import TextInput from "src/components/form/textInput";
import HTML from "src/components/html";
import HeadLayout from "src/components/layouts/headLayout";
import assertNever from "src/helpers/assertNever";
import { currentDateInput, formatDate } from "src/helpers/date";
import * as classNames from "src/pages/registration.module.css";

enum Page {
  PersonalInfo = "personalInfo",
  Waiver = "waiver",
  EmergencyContact = "emergencyContact",
  Submitted = "submitted",
}

const findPage = (currentPage: Page, offset: number): Page => {
  const values = Object.values(Page);
  const currentPageIndex = values.findIndex((page) => page === currentPage);
  if (currentPageIndex === -1) {
    return currentPage;
  }

  const pageIndex = currentPageIndex + offset;
  if (pageIndex < 0 || pageIndex >= values.length) {
    return currentPage;
  }

  return values[pageIndex];
};

export default function Registration(): React.JSX.Element {
  const { metadata, releaseOfParticipation } = useStaticQuery<Queries.RegistrationQuery>(graphql`
    query Registration {
      metadata: markdownRemark(fileName: { eq: "metadata" }, fileRelativeDirectory: { eq: "" }) {
        ...MetadataFragment
      }
      releaseOfParticipation: markdownRemark(
        fileRelativeDirectory: { eq: "registration" }
        fileName: { eq: "release-of-participation" }
      ) {
        html
      }
    }
  `);

  const [page, setPage] = useState(Page.PersonalInfo);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [signature, setSignature] = useState("");
  const [date, setDate] = useState(currentDateInput());

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");

  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    switch (page) {
      case Page.Submitted: {
        return false;
      }
      case Page.EmergencyContact: {
        if (!emergencyName || !emergencyEmail || !emergencyPhone || !emergencyRelation) {
          return false;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case Page.Waiver: {
        if (!signature || !date) {
          return false;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case Page.PersonalInfo: {
        if (!name || !email || !phone) {
          return false;
        }
        return true;
      }
      default: {
        assertNever(page);
        return false;
      }
    }
  }, [
    date,
    email,
    emergencyEmail,
    emergencyName,
    emergencyPhone,
    emergencyRelation,
    name,
    page,
    phone,
    signature,
  ]);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setPhone("");
  }, []);

  const handleClear = useCallback(() => {
    setPage(Page.PersonalInfo);
    reset();
  }, [reset]);

  const handleBack = useCallback(() => {
    setPage(findPage(page, -1));
  }, [page]);

  const handleNext = useCallback(async () => {
    const nextPage = findPage(page, 1);
    if (nextPage === Page.Submitted) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch("https://www.formbackend.com/f/362d34dbb098fccb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          signature,
          date,
          emergencyName,
          emergencyEmail,
          emergencyPhone,
          emergencyRelation,
        }),
      });

      if (response.status === 422) {
        throw new Error("Validation error");
      } else if (!response.ok) {
        throw new Error("Something went wrong");
      }

      setLoading(false);
      reset();
    }

    setPage(nextPage);
  }, [
    date,
    email,
    emergencyEmail,
    emergencyName,
    emergencyPhone,
    emergencyRelation,
    name,
    page,
    phone,
    reset,
    signature,
  ]);

  return (
    <>
      <h1>Registration</h1>
      <p>
        Welcome to Big Apple Roll{" "}
        {metadata?.frontmatter?.start_date
          ? formatDate(metadata.frontmatter.start_date, { format: "year" })
          : ""}
        ! All skaters are required to complete this registration form and sign the Release of
        Participation before attending any Big Apple Roll skates.
      </p>
      {(() => {
        switch (page) {
          case Page.PersonalInfo: {
            return (
              <>
                <h2>Personal Information</h2>
                <form className={classNames.form}>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Full name:
                    </span>
                    <TextInput type="text" value={name} autoFocus onChange={setName} />
                  </label>

                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Email:
                    </span>
                    <TextInput type="email" value={email} onChange={setEmail} />
                  </label>

                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Phone number:
                    </span>
                    <TextInput type="tel" value={phone} onChange={setPhone} />
                  </label>
                </form>
              </>
            );
          }
          case Page.Waiver: {
            return (
              <>
                <h2>Release for Participation</h2>
                <HTML html={releaseOfParticipation?.html} />
                <form className={classNames.form}>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Signature:
                    </span>
                    <TextInput type="text" value={signature} autoFocus onChange={setSignature} />
                  </label>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Date:
                    </span>
                    <TextInput type="date" value={date} onChange={setDate} />
                  </label>
                </form>
              </>
            );
          }
          case Page.EmergencyContact: {
            return (
              <>
                <h2>Emergency Contact</h2>
                <form className={classNames.form}>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Emergency contact full name:
                    </span>
                    <TextInput
                      type="text"
                      value={emergencyName}
                      autoFocus
                      onChange={setEmergencyName}
                    />
                  </label>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Emergency contact email:
                    </span>
                    <TextInput type="email" value={emergencyEmail} onChange={setEmergencyEmail} />
                  </label>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Emergency contact phone number:
                    </span>
                    <TextInput type="tel" value={emergencyPhone} onChange={setEmergencyPhone} />
                  </label>
                  <label className={classNames.label}>
                    <span className={clsx(classNames.labelLabel, classNames.isRequired)}>
                      Relationship to self:
                    </span>
                    <TextInput
                      type="text"
                      value={emergencyRelation}
                      onChange={setEmergencyRelation}
                    />
                  </label>
                </form>
              </>
            );
          }
          case Page.Submitted: {
            return (
              <>
                <h2>Thank you for registering!</h2>
                <p>
                  Your registration has been submitted successfully. We&apos;re looking forward to
                  skating together!
                </p>
              </>
            );
          }
          default: {
            assertNever(page);
            return null;
          }
        }
      })()}
      <div className={classNames.footer}>
        <TextButton onClick={handleClear}>Clear</TextButton>
        {page !== Page.Submitted ? (
          <div className={classNames.footerRight}>
            <SurfaceButton
              color="accent3"
              size="small"
              disabled={page === Page.PersonalInfo || loading}
              onClick={handleBack}
            >
              Back
            </SurfaceButton>
            <SurfaceButton
              color="accent2"
              size="small"
              disabled={!isValid || loading}
              onClick={handleNext}
            >
              {page === Page.EmergencyContact ? "Submit" : "Next"}
            </SurfaceButton>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Registration" />;
}
