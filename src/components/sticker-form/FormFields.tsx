
import React from "react";
import AlbumSelector from "./AlbumSelector";
import BasicInfoFields from "./BasicInfoFields";
import LogoUploader from "./LogoUploader";
import CategorySelector from "./CategorySelector";
import StatusCheckboxes from "./StatusCheckboxes";

interface FormFieldsProps {
  name: string;
  setName: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  team: string;
  setTeam: (value: string) => void;
  teamLogo: string;
  setTeamLogo: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  albumId: string;
  setAlbumId: (value: string) => void;
  isOwned: boolean;
  setIsOwned: (value: boolean) => void;
  isDuplicate: boolean;
  setIsDuplicate: (value: boolean) => void;
}

const FormFields = ({
  name,
  setName,
  number,
  setNumber,
  team,
  setTeam,
  teamLogo,
  setTeamLogo,
  category,
  setCategory,
  albumId,
  setAlbumId,
  isOwned,
  setIsOwned,
  isDuplicate,
  setIsDuplicate
}: FormFieldsProps) => {
  return (
    <>
      <AlbumSelector 
        albumId={albumId} 
        setAlbumId={setAlbumId} 
      />
      
      <BasicInfoFields
        name={name}
        setName={setName}
        number={number}
        setNumber={setNumber}
        team={team}
        setTeam={setTeam}
      />

      <LogoUploader 
        teamLogo={teamLogo} 
        setTeamLogo={setTeamLogo} 
      />
      
      <CategorySelector 
        category={category} 
        setCategory={setCategory} 
      />
      
      <StatusCheckboxes
        isOwned={isOwned}
        setIsOwned={setIsOwned}
        isDuplicate={isDuplicate}
        setIsDuplicate={setIsDuplicate}
      />
    </>
  );
};

export default FormFields;
