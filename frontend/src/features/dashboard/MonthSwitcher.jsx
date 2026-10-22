import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@untitledui/icons';
import { Button } from '../../components/base/buttons/button';
import { getPreviousMonth, getNextMonth, formatMonth, isCurrentMonthOrLater } from '../../lib/format';

export default function MonthSwitcher({ month, onMonthChange }) {
  const [searchParams] = useSearchParams();
  const currentUrlMonth = searchParams.get('month') || month;

  const prevMonth = getPreviousMonth(currentUrlMonth);
  const nextMonth = getNextMonth(currentUrlMonth);
  const isCurrent = isCurrentMonthOrLater(currentUrlMonth);

  return (
    <div className="flex items-center gap-2">
      <Button
        color="tertiary"
        size="sm"
        iconLeading={ArrowLeft}
        onClick={() => onMonthChange(prevMonth)}
        aria-label="Previous month"
      />
      <span className="font-medium text-secondary">{formatMonth(currentUrlMonth)}</span>
      <Button
        color="tertiary"
        size="sm"
        iconLeading={ArrowRight}
        onClick={() => onMonthChange(nextMonth)}
        isDisabled={isCurrent}
        aria-label="Next month"
      />
    </div>
  );
}