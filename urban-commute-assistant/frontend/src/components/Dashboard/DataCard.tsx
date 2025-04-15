import React, { ReactNode } from 'react';

interface DataCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, description, icon }) => {
    return (
        <div className="data-card">
            {icon && <div className="data-card-icon">{icon}</div>}
            <h3 className="data-card-title">{title}</h3>
            <p className="data-card-value">{value}</p>
            {description && <p className="data-card-description">{description}</p>}
        </div>
    );
};

export default DataCard;