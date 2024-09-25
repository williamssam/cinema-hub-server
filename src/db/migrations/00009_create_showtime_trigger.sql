-- create trigger to convert price to cents for showtime
CREATE OR REPLACE FUNCTION convert_price_to_cents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.price := NEW.price * 100;
    RETURN NEW;
END;
$$;

CREATE TRIGGER convert_price_to_cents
BEFORE INSERT OR UPDATE
ON showtime
FOR EACH ROW
EXECUTE FUNCTION convert_price_to_cents();
