-- Remove black as a signature option by converting existing black signatures to white.
UPDATE vote_signatures
SET color = '#FFFFFF'
WHERE upper(color) IN ('#111827', '#000000', 'BLACK');
